const express = require('express')
const { protect, adminOnly } = require('../middleware/auth')
const Product = require('../models/Product')
const Order = require('../models/Order')
const ContactMessage = require('../models/ContactMessage')
const asyncHandler = require('../utils/asyncHandler')

const router = express.Router()

router.get(
  '/stats',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const [products, orders, contactMessages, newContactMessages, newOrders, lowStockCount, lowStockProducts] = await Promise.all([
      Product.estimatedDocumentCount(),
      Order.estimatedDocumentCount(),
      ContactMessage.estimatedDocumentCount(),
      ContactMessage.countDocuments({ status: 'new' }),
      Order.countDocuments({ status: 'pending' }),
      Product.countDocuments({ stock: { $lte: 5 } }),
      Product.find({ stock: { $lte: 5 } })
        .select('_id name stock category updatedAt')
        .sort({ stock: 1, updatedAt: -1 })
        .limit(8)
        .lean(),
    ])

    const [recentOrders, recentContactMessages] = await Promise.all([
      Order.find({})
        .select('_id publicOrderId user shippingAddress.fullName totalPrice status createdAt')
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      ContactMessage.find({})
        .select('_id name email status createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ])

    res.json({
      products,
      orders,
      contactMessages,
      newContactMessages,
      newOrders,
      lowStockCount,
      lowStockProducts,
      recentOrders,
      recentContactMessages,
    })
  })
)

module.exports = router
