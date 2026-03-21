const mongoose = require('mongoose')

const contactMessageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 190 },
    message: { type: String, required: true, trim: true, maxlength: 4000 },
    status: { type: String, enum: ['new', 'read', 'archived'], default: 'new' },

    // Useful for spam/debugging; optional.
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
)

contactMessageSchema.index({ status: 1, createdAt: -1 })
contactMessageSchema.index({ email: 1, createdAt: -1 })

module.exports = mongoose.model('ContactMessage', contactMessageSchema)
