const express = require('express')
const SiteAsset = require('../models/SiteAsset')
const { protect, adminOnly } = require('../middleware/auth')

const router = express.Router()

// Public: list all assets
router.get('/', async (req, res) => {
  const assets = await SiteAsset.find({}).sort({ key: 1 })
  res.json(assets)
})

// Public: get asset by key
router.get('/:key', async (req, res) => {
  const asset = await SiteAsset.findOne({ key: req.params.key })
  if (!asset) return res.status(404).json({ message: 'Asset not found' })
  res.json(asset)
})

// Admin: upsert asset url
router.put('/:key', protect, adminOnly, async (req, res) => {
  const { url } = req.body
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ message: 'url is required' })
  }

  const key = String(req.params.key || '').trim()
  if (!key) return res.status(400).json({ message: 'Invalid key' })

  const asset = await SiteAsset.findOneAndUpdate(
    { key },
    { key, url: url.trim() },
    { new: true, upsert: true }
  )

  res.json(asset)
})

// Admin: delete asset
router.delete('/:key', protect, adminOnly, async (req, res) => {
  const asset = await SiteAsset.findOne({ key: req.params.key })
  if (!asset) return res.status(404).json({ message: 'Asset not found' })
  await asset.deleteOne()
  res.json({ message: 'Asset removed' })
})

module.exports = router

