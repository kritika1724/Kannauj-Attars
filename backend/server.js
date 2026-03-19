const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
let cookieParser
try {
  cookieParser = require('cookie-parser')
} catch {
  cookieParser = null
}
const connectDB = require('./config/db')
const path = require('path')
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/users')
const productRoutes = require('./routes/products')
const uploadRoutes = require('./routes/uploads')
const orderRoutes = require('./routes/orders')
const adminRoutes = require('./routes/admin')
const assetRoutes = require('./routes/assets')
const oauthRoutes = require('./routes/oauth')
const { router: sessionRoutes } = require('./routes/session')
const paymentRoutes = require('./routes/payments')
const contactRoutes = require('./routes/contact')
const galleryRoutes = require('./routes/gallery')

dotenv.config()
// Load env from backend/.env even if server is started from the repo root.
dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
app.set('trust proxy', 1)
app.disable('x-powered-by')
app.use(express.json())
if (cookieParser) {
  app.use(cookieParser())
} else {
  // Minimal cookie parser (fallback when deps can't be installed).
  app.use((req, _res, next) => {
    const header = req.headers.cookie || ''
    const out = {}
    header.split(';').forEach((part) => {
      const s = part.trim()
      if (!s) return
      const idx = s.indexOf('=')
      if (idx === -1) return
      const k = s.slice(0, idx).trim()
      const v = s.slice(idx + 1).trim()
      if (!k) return
      try {
        out[k] = decodeURIComponent(v)
      } catch {
        out[k] = v
      }
    })
    req.cookies = out
    next()
  })
}

// Allow frontend (different origin/port) to load images from /uploads.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  })
)
app.use(morgan('dev'))

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
)

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((x) => x.trim())
  .filter(Boolean)

app.use(
  cors({
    origin(origin, cb) {
      // Allow non-browser clients (curl/postman) with no origin.
      if (!origin) return cb(null, true)

      // Explicit allowlist
      if (allowedOrigins.includes(origin)) return cb(null, true)

      // Dev convenience: allow any localhost port so Vite can move 5173 -> 5174, etc.
      if (
        process.env.NODE_ENV !== 'production' &&
        (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin))
      ) {
        return cb(null, true)
      }

      return cb(new Error(`CORS blocked for origin: ${origin}`))
    },
    credentials: true,
  })
)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/assets', assetRoutes)
app.use('/api/oauth', oauthRoutes)
app.use('/api/session', sessionRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/gallery', galleryRoutes)

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Serve the React app in production (single deploy).
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'frontend', 'dist')
  app.use(express.static(distPath))
  app.get('*', (req, res) => {
    // Don’t hijack API or uploads routes
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return res.status(404).json({ message: 'Not found' })
    }
    return res.sendFile(path.join(distPath, 'index.html'))
  })
}

// API 404
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found' })
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: err?.message || 'Server error' })
})

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)

    // Use a fixed port to avoid frontend/backend mismatches.
    const port = Number(process.env.PORT || 5000)
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`)
    })
    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        console.error(
          `Port ${port} is already in use. Stop the other process or change PORT in backend/.env (e.g. 5002).`
        )
        process.exit(1)
      }
      console.error('Server failed to listen', err)
      process.exit(1)
    })
  } catch (error) {
    console.error('Failed to start server', error)
    process.exit(1)
  }
}

start()
