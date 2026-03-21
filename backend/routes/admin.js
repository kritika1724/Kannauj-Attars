const express = require('express')
const { protect, adminOnly } = require('../middleware/auth')
const Product = require('../models/Product')
const User = require('../models/User')
const Order = require('../models/Order')
const ContactMessage = require('../models/ContactMessage')
const asyncHandler = require('../utils/asyncHandler')

const router = express.Router()

router.get(
  '/stats',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const [products, users, orders, contactMessages, newContactMessages, newOrders] = await Promise.all([
      Product.estimatedDocumentCount(),
      User.estimatedDocumentCount(),
      Order.estimatedDocumentCount(),
      ContactMessage.estimatedDocumentCount(),
      ContactMessage.countDocuments({ status: 'new' }),
      Order.countDocuments({ status: 'pending' }),
    ])

    const [recentOrders, recentContactMessages] = await Promise.all([
      Order.find({})
        .select('_id user shippingAddress.fullName totalPrice status createdAt')
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
      users,
      orders,
      contactMessages,
      newContactMessages,
      newOrders,
      recentOrders,
      recentContactMessages,
    })
  })
)

module.exports = router
