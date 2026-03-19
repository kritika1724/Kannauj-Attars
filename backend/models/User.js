const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Admin' },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    // Backward-compatible field; admin is derived from env email, not stored here.
    isAdmin: { type: Boolean, default: false, immutable: true },
    // Stored role is kept for backward compatibility, but admin access is NOT derived from it.
    // Admin is derived strictly from env-based ADMIN_EMAIL at login/request time.
    role: { type: String, default: 'user', immutable: true },
    refreshTokenHash: { type: String, default: '', select: false },
    refreshTokenExpiresAt: { type: Date, default: null, select: false },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
)

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next()
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.matchPassword = function matchPassword(entered) {
  return bcrypt.compare(entered, this.password)
}

module.exports = mongoose.model('User', userSchema)
