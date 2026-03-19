const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const ACCESS_MINUTES = Number(process.env.ACCESS_TOKEN_MINUTES || 15)
const REFRESH_DAYS = Number(process.env.REFRESH_TOKEN_DAYS || 30)

const signAccessToken = (userId) => {
  return jwt.sign({ id: userId, typ: 'access' }, process.env.JWT_SECRET, {
    expiresIn: `${ACCESS_MINUTES}m`,
  })
}

const signRefreshToken = (userId) => {
  const jti = crypto.randomBytes(16).toString('hex')
  return jwt.sign({ id: userId, typ: 'refresh', jti }, process.env.JWT_SECRET, {
    expiresIn: `${REFRESH_DAYS}d`,
  })
}

const hashToken = (token) => {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex')
}

const refreshExpiryDate = () => {
  const ms = REFRESH_DAYS * 24 * 60 * 60 * 1000
  return new Date(Date.now() + ms)
}

module.exports = {
  ACCESS_MINUTES,
  REFRESH_DAYS,
  signAccessToken,
  signRefreshToken,
  hashToken,
  refreshExpiryDate,
}

