const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
let sharp
try {
  // Optional dependency (recommended) to convert HEIC/HEIF to JPG/WebP.
  // If not installed, uploads still work for JPG/PNG/WebP.
  sharp = require('sharp')
} catch {
  sharp = null
}
const { protect, adminOnly } = require('../middleware/auth')

const router = express.Router()

const uploadsDir = path.join(__dirname, '..', 'uploads')
fs.mkdirSync(uploadsDir, { recursive: true })

const getCloudinaryConfig = () => {
  const cloudName = String(process.env.CLOUDINARY_CLOUD_NAME || '').trim()
  const apiKey = String(process.env.CLOUDINARY_API_KEY || '').trim()
  const apiSecret = String(process.env.CLOUDINARY_API_SECRET || '').trim()

  if (!cloudName || !apiKey || !apiSecret) return null

  return { cloudName, apiKey, apiSecret }
}

const uploadToCloudinary = async ({ buffer, filename, mimeType }) => {
  const cfg = getCloudinaryConfig()
  if (!cfg) return null

  const timestamp = Math.floor(Date.now() / 1000)
  const folder = String(process.env.CLOUDINARY_FOLDER || 'kannauj-attars').trim()
  const publicId = path.basename(filename, path.extname(filename))

  const signSource = [`folder=${folder}`, `public_id=${publicId}`, `timestamp=${timestamp}`].join('&')
  const signature = crypto
    .createHash('sha1')
    .update(`${signSource}${cfg.apiSecret}`)
    .digest('hex')

  const form = new FormData()
  form.append('file', new Blob([buffer], { type: mimeType || 'application/octet-stream' }), filename)
  form.append('api_key', cfg.apiKey)
  form.append('timestamp', String(timestamp))
  form.append('folder', folder)
  form.append('public_id', publicId)
  form.append('signature', signature)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const msg = data?.error?.message || 'Cloudinary upload failed'
    throw new Error(msg)
  }

  return {
    url: data.secure_url || data.url,
    absoluteUrl: data.secure_url || data.url,
    provider: 'cloudinary',
    publicId: data.public_id || publicId,
  }
}

const saveLocally = ({ buffer, filename, req }) => {
  fs.writeFileSync(path.join(uploadsDir, filename), buffer)

  const relativePath = `/uploads/${filename}`
  const absoluteUrl = `${req.protocol}://${req.get('host')}${relativePath}`

  return {
    url: relativePath,
    absoluteUrl,
    provider: 'local',
  }
}

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Only images are allowed'), false)
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 },
})

router.post('/', protect, adminOnly, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Upload failed' })
    }

    try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' })

      const originalExt = path.extname(req.file.originalname || '').toLowerCase()
      const safeBase =
        path
          .basename(req.file.originalname || 'image', originalExt)
          .replace(/[^\w\-]+/g, '-')
          .replace(/-+/g, '-')
          .slice(0, 60) || 'image'

      const stamp = Date.now()

      let outExt = originalExt || '.jpg'
      let outBuffer = req.file.buffer

      const isHeic =
        originalExt === '.heic' ||
        originalExt === '.heif' ||
        req.file.mimetype === 'image/heic' ||
        req.file.mimetype === 'image/heif'

      // Many browsers don't display HEIC directly. Convert if we can.
      if (isHeic) {
        if (!sharp) {
          return res.status(400).json({
            message:
              'HEIC images are not supported in browsers. Please upload JPG/PNG/WebP, or install sharp on the backend to auto-convert.',
          })
        }
        outExt = '.jpg'
        outBuffer = await sharp(req.file.buffer).jpeg({ quality: 88 }).toBuffer()
      }

      // Normalize allowed extensions
      if (!['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif'].includes(outExt)) {
        // Default to jpg so the browser can display it
        outExt = '.jpg'
        if (sharp) {
          outBuffer = await sharp(req.file.buffer).jpeg({ quality: 88 }).toBuffer()
        }
      }

      const filename = `${safeBase}-${stamp}${outExt}`
      const uploaded =
        (await uploadToCloudinary({
          buffer: outBuffer,
          filename,
          mimeType: req.file.mimetype,
        })) || saveLocally({ buffer: outBuffer, filename, req })

      return res.status(201).json({
        url: uploaded.url,
        absoluteUrl: uploaded.absoluteUrl,
        provider: uploaded.provider,
      })
    } catch (e) {
      return res.status(400).json({ message: e.message || 'Upload failed' })
    }
  })
})

module.exports = router
