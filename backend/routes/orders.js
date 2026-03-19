const express = require('express')
const Order = require('../models/Order')
const Product = require('../models/Product')
const { protect, adminOnly } = require('../middleware/auth')

const router = express.Router()

const packToGrams = (label) => {
  const str = String(label || '').toLowerCase().replace(/,/g, '').trim()
  const kg = str.match(/(\d+(?:\.\d+)?)\s*kg\b/)
  if (kg) return Number(kg[1]) * 1000
  const gm = str.match(/(\d+(?:\.\d+)?)\s*(gm|g)\b/)
  if (gm) return Number(gm[1])
  return null
}

const isBulkPack = (label) => {
  const grams = packToGrams(label)
  return grams !== null && Number.isFinite(grams) && grams >= 1000
}

// Create order
router.post('/', protect, async (req, res) => {
  if (req.user?.isAdmin === true) {
    return res.status(403).json({ message: 'Admins cannot place orders' })
  }

  const { orderItems, shippingAddress, paymentMethod } = req.body

  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    return res.status(400).json({ message: 'Order items are required' })
  }

  if (!shippingAddress) {
    return res.status(400).json({ message: 'Shipping address is required' })
  }

  // Recalculate prices from DB (don’t trust client pricing)
  const productIds = orderItems.map((item) => item.product)
  const products = await Product.find({ _id: { $in: productIds } })

  let normalizedItems
  try {
    normalizedItems = orderItems.map((item) => {
      const product = products.find((p) => p._id.toString() === item.product)
      if (!product) {
        throw new Error('Invalid product in order')
      }

      const requestedPackLabel = (item.packLabel || '').trim()
      const pack =
        requestedPackLabel && Array.isArray(product.packs)
          ? product.packs.find((p) => (p.label || '').trim() === requestedPackLabel)
          : null

      if (Array.isArray(product.packs) && product.packs.length > 0) {
        if (!requestedPackLabel) {
          throw new Error(`Pack size is required for product: ${product.name}`)
        }
        if (!pack) {
          throw new Error(`Invalid pack size for product: ${product.name}`)
        }
      }

      // Enforce bulk inquiry flow: large pack sizes should not be checkout-able.
      const selectedLabel = pack ? pack.label : requestedPackLabel || ''
      if (selectedLabel && isBulkPack(selectedLabel)) {
        throw new Error(`Bulk pack size selected for ${product.name}. Please contact us for bulk/industrial orders.`)
      }

      return {
        product: product._id,
        name: product.name,
        qty: Number(item.qty || 1),
        price: pack ? pack.price : product.price,
        image: product.images?.[0] || '',
        pack: { label: pack ? pack.label : requestedPackLabel || '' },
      }
    })
  } catch (e) {
    return res.status(400).json({ message: e.message || 'Invalid order items' })
  }

  const itemsPrice = normalizedItems.reduce((sum, item) => sum + item.qty * item.price, 0)
  const shippingPrice = 0
  const taxPrice = 0
  const totalPrice = itemsPrice + shippingPrice + taxPrice

  const method = String(paymentMethod || 'COD').trim().toUpperCase()
  const COD_LIMIT = Number(process.env.COD_LIMIT || 2000)
  if (method === 'COD' && Number.isFinite(COD_LIMIT) && totalPrice > COD_LIMIT) {
    return res.status(400).json({
      message: `Cash on Delivery is not available for orders above ₹${COD_LIMIT}. Please choose online payment.`,
    })
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems: normalizedItems,
    shippingAddress,
    paymentMethod: method || 'COD',
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    status: 'pending',
  })

  res.status(201).json(order)
})

// Get my orders
router.get('/mine', protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
  res.json(orders)
})

// Get all orders (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 })
  res.json(orders)
})

// Get order by id
router.get('/:id', protect, async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email')
  if (!order) {
    return res.status(404).json({ message: 'Order not found' })
  }

  // User can only see own orders unless admin
  if (!req.user.isAdmin && order.user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' })
  }

  res.json(order)
})

// Mark order as paid
router.put('/:id/pay', protect, async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) {
    return res.status(404).json({ message: 'Order not found' })
  }

  if (!req.user.isAdmin && order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' })
  }

  order.isPaid = true
  order.paidAt = new Date()
  order.paymentResult = {
    id: req.body?.id || 'manual',
    status: req.body?.status || 'paid',
    email: req.body?.email || req.user.email,
  }
  if (order.status === 'pending') {
    order.status = 'confirmed'
  }

  const updated = await order.save()
  res.json(updated)
})

// Admin: update status
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  const { status } = req.body
  const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' })
  }

  const order = await Order.findById(req.params.id)
  if (!order) {
    return res.status(404).json({ message: 'Order not found' })
  }

  order.status = status
  if (status === 'delivered') {
    order.isDelivered = true
    order.deliveredAt = new Date()
  }

  const updated = await order.save()
  res.json(updated)
})

// User: cancel own order (only before shipping)
router.put('/:id/cancel', protect, async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) {
    return res.status(404).json({ message: 'Order not found' })
  }

  // User can only cancel own orders unless admin
  if (!req.user.isAdmin && order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' })
  }

  if (order.status === 'cancelled') {
    return res.json(order)
  }

  if (order.status === 'shipped' || order.status === 'delivered') {
    return res.status(400).json({ message: 'Order cannot be cancelled after shipping' })
  }

  order.status = 'cancelled'
  order.cancelledAt = new Date()
  order.isDelivered = false
  order.deliveredAt = null

  const updated = await order.save()
  res.json(updated)
})

module.exports = router
