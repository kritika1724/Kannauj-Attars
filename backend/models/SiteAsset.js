const mongoose = require('mongoose')

const siteAssetSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    url: { type: String, required: true, trim: true }, // e.g. "/uploads/abc.jpg" (preferred) or full URL
  },
  { timestamps: true }
)

module.exports = mongoose.model('SiteAsset', siteAssetSchema)

