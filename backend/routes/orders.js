const express = require('express')
const mongoose = require('mongoose')
const Order = require('../models/Order')
const Product = require('../models/Product')
const { protect, optionalProtect, adminOnly } = require('../middleware/auth')
const asyncHandler = require('../utils/asyncHandler')

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

const normalizePhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return ''
  return digits.length > 10 ? digits.slice(-10) : digits
}

const canAccessOrder = (reqUser, orderUserId) => {
  if (!reqUser) return false
  if (reqUser.isAdmin === true) return true
  if (!orderUserId) return false
  return String(orderUserId) === String(reqUser._id)
}

// Create order
router.post(
  '/',
  optionalProtect,
  asyncHandler(async (req, res) => {
    if (req.user?.isAdmin === true) {
      return res.status(403).json({ message: 'Admins cannot place orders' })
    }

    const { orderItems, shippingAddress, paymentMethod } = req.body

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: 'Order items are required' })
    }

    if (
      !shippingAddress?.fullName ||
      !shippingAddress?.email ||
      !shippingAddress?.phone ||
      !shippingAddress?.whatsapp
    ) {
      return res.status(400).json({ message: 'Name, email, phone, and WhatsApp number are required' })
    }

    const productIds = [...new Set(orderItems.map((item) => String(item.product || '')).filter(Boolean))]
    const products = await Product.find({ _id: { $in: productIds } })
      .select('name price packs images')
      .lean()

    const productMap = new Map(products.map((product) => [String(product._id), product]))

    let normalizedItems
    try {
      normalizedItems = orderItems.map((item) => {
        const product = productMap.get(String(item.product))
        if (!product) {
          throw new Error('Invalid product in order')
        }

        const requestedPackLabel = String(item.packLabel || '').trim()
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

        const selectedLabel = pack ? pack.label : requestedPackLabel || ''
        if (selectedLabel && isBulkPack(selectedLabel)) {
          throw new Error(`Bulk pack size selected for ${product.name}. Please contact us for bulk/industrial orders.`)
        }

        const qty = Math.max(1, Number(item.qty || 1))

        return {
          product: product._id,
          name: product.name,
          qty,
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
      user: req.user?._id || null,
      orderItems: normalizedItems,
      shippingAddress: {
        ...shippingAddress,
        email: String(shippingAddress.email || '').trim().toLowerCase(),
        phone: String(shippingAddress.phone || '').trim(),
        whatsapp: String(shippingAddress.whatsapp || '').trim(),
      },
      paymentMethod: method || 'COD',
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      status: 'pending',
    })

    res.status(201).json(order)
  })
)

// Public: track order using short tracking ID + phone/WhatsApp
router.get(
  '/track/:publicOrderId',
  asyncHandler(async (req, res) => {
    const publicOrderId = String(req.params.publicOrderId || '').trim().toUpperCase()
    const contactValue = normalizePhone(req.query.whatsapp || req.query.phone || '')

    if (!publicOrderId) {
      return res.status(400).json({ message: 'Order id is required' })
    }

    if (!contactValue) {
      return res.status(400).json({ message: 'WhatsApp or phone number is required' })
    }

    let order = await Order.findOne({ publicOrderId })
      .select(
        'publicOrderId status createdAt updatedAt paymentMethod isPaid paidAt totalPrice itemsPrice shippingPrice taxPrice orderItems shippingAddress.fullName shippingAddress.phone shippingAddress.whatsapp shippingAddress.email shippingAddress.city shippingAddress.state shippingAddress.postalCode shippingAddress.country'
      )
      .lean()

    if (!order && mongoose.isValidObjectId(publicOrderId)) {
      order = await Order.findById(publicOrderId)
        .select(
          '_id publicOrderId status createdAt updatedAt paymentMethod isPaid paidAt totalPrice itemsPrice shippingPrice taxPrice orderItems shippingAddress.fullName shippingAddress.phone shippingAddress.whatsapp shippingAddress.email shippingAddress.city shippingAddress.state shippingAddress.postalCode shippingAddress.country'
        )
        .lean()
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const allowedContacts = [order.shippingAddress?.whatsapp, order.shippingAddress?.phone]
      .map(normalizePhone)
      .filter(Boolean)

    if (!allowedContacts.includes(contactValue)) {
      return res.status(404).json({ message: 'Order not found for the provided details' })
    }

    res.json(order)
  })
)

// Get my orders
router.get(
  '/mine',
  protect,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id })
      .select('_id publicOrderId totalPrice createdAt status')
      .sort({ createdAt: -1 })
      .lean()
    res.json(orders)
  })
)

// Get all orders (admin)
router.get(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({})
      .select(
        '_id publicOrderId user shippingAddress.fullName shippingAddress.email shippingAddress.whatsapp totalPrice paymentMethod status createdAt'
      )
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean()
    res.json(orders)
  })
)

// Get order by id
router.get(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email').lean()
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (!canAccessOrder(req.user, order.user?._id || order.user)) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    res.json(order)
  })
)

// Mark order as paid
router.put(
  '/:id/pay',
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (!canAccessOrder(req.user, order.user)) {
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
)

// Admin: update status
router.put(
  '/:id/status',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
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
    } else {
      order.isDelivered = false
      order.deliveredAt = null
    }

    if (status === 'cancelled' && !order.cancelledAt) {
      order.cancelledAt = new Date()
    } else if (status !== 'cancelled') {
      order.cancelledAt = null
    }

    const updated = await order.save()
    await updated.populate('user', 'name email')
    res.json(updated)
  })
)

// User: cancel own order (only before shipping)
router.put(
  '/:id/cancel',
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (!canAccessOrder(req.user, order.user)) {
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
)

module.exports = router
