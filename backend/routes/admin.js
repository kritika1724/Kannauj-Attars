const express = require('express')
const { protect, adminOnly } = require('../middleware/auth')
const Product = require('../models/Product')
const User = require('../models/User')
const Order = require('../models/Order')
const ContactMessage = require('../models/ContactMessage')

const router = express.Router()

router.get('/stats', protect, adminOnly, async (req, res) => {
  const [products, users, orders, contactMessages, newContactMessages, newOrders] = await Promise.all([
    Product.countDocuments(),
    User.countDocuments(),
    Order.countDocuments(),
    ContactMessage.countDocuments(),
    ContactMessage.countDocuments({ status: 'new' }),
    Order.countDocuments({ status: 'pending' }),
  ])

  const [recentOrders, recentContactMessages] = await Promise.all([
    Order.find({}).populate('user', 'name email').sort({ createdAt: -1 }).limit(5),
    ContactMessage.find({}).sort({ createdAt: -1 }).limit(5),
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

module.exports = router
