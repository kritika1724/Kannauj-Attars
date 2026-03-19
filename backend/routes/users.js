const express = require('express')
const User = require('../models/User')
const { protect } = require('../middleware/auth')
const { isAdminEmail } = require('../config/admin')
const { signAccessToken, signRefreshToken, hashToken, refreshExpiryDate } = require('../config/tokens')
const { setCookie, userPayload } = require('./session')

const router = express.Router()

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' })
  }

  const normalizedEmail = email.toLowerCase()
  // Prevent "spoofing" the fixed admin identity via public registration.
  // Bootstrap admin in the DB manually (or via a private script) instead.
  if (isAdminEmail(normalizedEmail) && process.env.ALLOW_ADMIN_REGISTER !== 'true') {
    return res.status(403).json({
      message:
        'Admin account cannot be created via public register. Create the admin user directly in the database.',
    })
  }
  const existing = await User.findOne({ email: normalizedEmail })
  if (existing) {
    return res.status(400).json({ message: 'Email already in use' })
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    role: 'user',
  })

  // Set refresh cookie + store refresh hash (single active session per account)
  const refresh = signRefreshToken(user._id)
  await User.updateOne(
    { _id: user._id },
    { $set: { refreshTokenHash: hashToken(refresh), refreshTokenExpiresAt: refreshExpiryDate() } }
  )
  setCookie(res, refresh)

  const access = signAccessToken(user._id)
  res.status(201).json({
    token: access,
    user: userPayload(user),
  })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const normalizedEmail = email.toLowerCase()
  const user = await User.findOne({ email: normalizedEmail })
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const refresh = signRefreshToken(user._id)
  await User.updateOne(
    { _id: user._id },
    { $set: { refreshTokenHash: hashToken(refresh), refreshTokenExpiresAt: refreshExpiryDate() } }
  )
  setCookie(res, refresh)

  const access = signAccessToken(user._id)
  res.json({
    token: access,
    user: userPayload(user),
  })
})

router.get('/me', protect, async (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    isAdmin: isAdminEmail(req.user.email),
    role: isAdminEmail(req.user.email) ? 'admin' : 'user',
  })
})

module.exports = router
