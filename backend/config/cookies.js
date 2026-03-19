const isProd = () => process.env.NODE_ENV === 'production'

const getRefreshCookieOptions = () => {
  // When using same-origin deploy (recommended), SameSite=Lax works great.
  // If you host frontend+backend on different domains, set:
  // COOKIE_SAMESITE=none and COOKIE_SECURE=true (requires HTTPS).
  const sameSite = process.env.COOKIE_SAMESITE || (isProd() ? 'lax' : 'lax')
  const secure =
    process.env.COOKIE_SECURE !== undefined
      ? process.env.COOKIE_SECURE === 'true'
      : isProd()

  const domain = (process.env.COOKIE_DOMAIN || '').trim() || undefined

  return {
    httpOnly: true,
    sameSite,
    secure,
    domain,
    path: '/api/session',
  }
}

module.exports = { getRefreshCookieOptions }

