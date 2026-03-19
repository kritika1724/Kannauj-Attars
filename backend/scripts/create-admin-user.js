/* eslint-disable no-console */
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config()
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const User = require('../models/User')
const { resolveAdminEmail, isAdminEmail } = require('../config/admin')

async function main() {
  const mongo = process.env.MONGO_URI
  const adminEmail = resolveAdminEmail()
  const password = process.env.ADMIN_PASSWORD || process.env.ADMIN_BOOTSTRAP_PASSWORD

  if (!mongo) throw new Error('MONGO_URI is required')
  if (!adminEmail) throw new Error('ADMIN_EMAIL (or ADMIN_ID) is required')
  if (!password) {
    throw new Error('Set ADMIN_PASSWORD (or ADMIN_BOOTSTRAP_PASSWORD) to create the admin user')
  }

  await mongoose.connect(mongo)

  const existing = await User.findOne({ email: adminEmail.toLowerCase() })
  if (existing) {
    console.log(`Admin user already exists: ${existing.email}`)
    process.exit(0)
  }

  const user = await User.create({
    name: 'Admin',
    email: adminEmail.toLowerCase(),
    password,
    role: 'user', // admin is derived from email, not stored role
  })

  console.log(`Created user: ${user.email}`)
  console.log(`Admin derived by email: ${isAdminEmail(user.email) ? 'YES' : 'NO'}`)
  process.exit(0)
}

main().catch((e) => {
  console.error(e.message || e)
  process.exit(1)
})

