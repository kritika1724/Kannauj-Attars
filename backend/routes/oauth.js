const express = require('express')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { isAdminEmail, resolveAdminEmail } = require('../config/admin')

const router = express.Router()

const frontendOrigin = () =>
  (process.env.FRONTEND_ORIGIN || process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')[0]
    .trim()

const backendPublicUrl = (req) =>
  String(process.env.BACKEND_PUBLIC_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '')

const makeState = () => {
  // Signed state token (10 min) to reduce CSRF risk without server-side sessions.
  return jwt.sign({ t: Date.now(), n: crypto.randomBytes(8).toString('hex') }, process.env.JWT_SECRET, {
    expiresIn: '10m',
  })
}

const verifyState = (state) => {
  try {
    jwt.verify(state, process.env.JWT_SECRET)
    return true
  } catch {
    return false
  }
}

const randomPassword = () => crypto.randomBytes(32).toString('hex')

const { signAccessToken, signRefreshToken, hashToken, refreshExpiryDate } = require('../config/tokens')
const { setCookie } = require('./session')

const redirectWithError = (res, code, message) => {
  const target = `${frontendOrigin()}/oauth/callback?error=${encodeURIComponent(
    message || 'OAuth failed'
  )}`
  return res.status(code || 400).redirect(target)
}

const ensureUserForEmail = async ({ email, name }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!normalizedEmail) throw new Error('Email not available from provider')

  const adminEmail = resolveAdminEmail()
  const existing = await User.findOne({ email: normalizedEmail })

  // Do not auto-create admin user via social login.
  if (!existing && adminEmail && normalizedEmail === adminEmail) {
    throw new Error('Admin account must be created manually in the database')
  }

  if (existing) return existing

  const user = await User.create({
    name: name || 'User',
    email: normalizedEmail,
    password: randomPassword(),
    role: 'user',
  })

  return user
}

// -------- Google --------
router.get('/google/start', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) return redirectWithError(res, 400, 'GOOGLE_CLIENT_ID is not configured')

  const state = makeState()
  const redirectUri = `${backendPublicUrl(req)}/api/oauth/google/callback`

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'openid email profile')
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('prompt', 'consent')

  return res.redirect(authUrl.toString())
})

router.get('/google/callback', async (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return redirectWithError(res, 400, 'Google OAuth is not configured')
  }

  const code = String(req.query.code || '')
  const state = String(req.query.state || '')
  if (!code) return redirectWithError(res, 400, 'Missing OAuth code')
  if (!state || !verifyState(state)) return redirectWithError(res, 400, 'Invalid OAuth state')

  const redirectUri = `${backendPublicUrl(req)}/api/oauth/google/callback`

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      const text = await tokenRes.text().catch(() => '')
      throw new Error(`Google token exchange failed (${tokenRes.status}): ${text.slice(0, 200)}`)
    }

    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token
    if (!accessToken) throw new Error('Missing Google access token')

    const userinfoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!userinfoRes.ok) {
      const text = await userinfoRes.text().catch(() => '')
      throw new Error(`Google userinfo failed (${userinfoRes.status}): ${text.slice(0, 200)}`)
    }

    const profile = await userinfoRes.json()
    const email = profile.email
    const name = profile.name || profile.given_name || 'User'

    const user = await ensureUserForEmail({ email, name })

    const refresh = signRefreshToken(user._id)
    await User.updateOne(
      { _id: user._id },
      { $set: { refreshTokenHash: hashToken(refresh), refreshTokenExpiresAt: refreshExpiryDate() } }
    )
    setCookie(res, refresh)

    // Access token is obtained by frontend via /api/session/refresh (cookie-based).
    return res.redirect(`${frontendOrigin()}/oauth/callback?success=1`)
  } catch (e) {
    return redirectWithError(res, 400, e.message || 'Google OAuth failed')
  }
})

// -------- GitHub --------
router.get('/github/start', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) return redirectWithError(res, 400, 'GITHUB_CLIENT_ID is not configured')

  const state = makeState()
  const redirectUri = `${backendPublicUrl(req)}/api/oauth/github/callback`

  const authUrl = new URL('https://github.com/login/oauth/authorize')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('scope', 'user:email')
  authUrl.searchParams.set('state', state)

  return res.redirect(authUrl.toString())
})

router.get('/github/callback', async (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return redirectWithError(res, 400, 'GitHub OAuth is not configured')
  }

  const code = String(req.query.code || '')
  const state = String(req.query.state || '')
  if (!code) return redirectWithError(res, 400, 'Missing OAuth code')
  if (!state || !verifyState(state)) return redirectWithError(res, 400, 'Invalid OAuth state')

  const redirectUri = `${backendPublicUrl(req)}/api/oauth/github/callback`

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    })

    const tokenData = await tokenRes.json().catch(() => ({}))
    const accessToken = tokenData.access_token
    if (!accessToken) throw new Error('Missing GitHub access token')

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'kannauj-attars',
    }

    const userRes = await fetch('https://api.github.com/user', { headers })
    const userProfile = await userRes.json().catch(() => ({}))
    const name = userProfile?.name || userProfile?.login || 'User'

    const emailsRes = await fetch('https://api.github.com/user/emails', { headers })
    const emails = await emailsRes.json().catch(() => [])
    const primary = Array.isArray(emails)
      ? emails.find((e) => e && e.primary && e.verified) || emails.find((e) => e && e.verified) || emails[0]
      : null
    const email = primary?.email
    if (!email) throw new Error('GitHub email not available (make sure email scope is allowed)')

    const user = await ensureUserForEmail({ email, name })

    const refresh = signRefreshToken(user._id)
    await User.updateOne(
      { _id: user._id },
      { $set: { refreshTokenHash: hashToken(refresh), refreshTokenExpiresAt: refreshExpiryDate() } }
    )
    setCookie(res, refresh)

    return res.redirect(`${frontendOrigin()}/oauth/callback?success=1`)
  } catch (e) {
    return redirectWithError(res, 400, e.message || 'GitHub OAuth failed')
  }
})

// -------- LinkedIn (basic) --------
router.get('/linkedin/start', (req, res) => {
  const clientId = process.env.LINKEDIN_CLIENT_ID
  if (!clientId) return redirectWithError(res, 400, 'LINKEDIN_CLIENT_ID is not configured')

  const state = makeState()
  const redirectUri = `${backendPublicUrl(req)}/api/oauth/linkedin/callback`

  const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization')
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('scope', 'r_liteprofile r_emailaddress')
  authUrl.searchParams.set('state', state)

  return res.redirect(authUrl.toString())
})

router.get('/linkedin/callback', async (req, res) => {
  const clientId = process.env.LINKEDIN_CLIENT_ID
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return redirectWithError(res, 400, 'LinkedIn OAuth is not configured')
  }

  const code = String(req.query.code || '')
  const state = String(req.query.state || '')
  if (!code) return redirectWithError(res, 400, 'Missing OAuth code')
  if (!state || !verifyState(state)) return redirectWithError(res, 400, 'Invalid OAuth state')

  const redirectUri = `${backendPublicUrl(req)}/api/oauth/linkedin/callback`

  try {
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })
    if (!tokenRes.ok) {
      const text = await tokenRes.text().catch(() => '')
      throw new Error(`LinkedIn token exchange failed (${tokenRes.status}): ${text.slice(0, 200)}`)
    }
    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token
    if (!accessToken) throw new Error('Missing LinkedIn access token')

    const emailRes = await fetch(
      'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const emailData = await emailRes.json().catch(() => ({}))
    const email =
      emailData?.elements?.[0]?.['handle~']?.emailAddress ||
      emailData?.elements?.[0]?.handle?.emailAddress
    if (!email) throw new Error('LinkedIn email not available')

    const profileRes = await fetch('https://api.linkedin.com/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const profile = await profileRes.json().catch(() => ({}))
    const name = [profile.localizedFirstName, profile.localizedLastName].filter(Boolean).join(' ') || 'User'

    const user = await ensureUserForEmail({ email, name })

    const refresh = signRefreshToken(user._id)
    await User.updateOne(
      { _id: user._id },
      { $set: { refreshTokenHash: hashToken(refresh), refreshTokenExpiresAt: refreshExpiryDate() } }
    )
    setCookie(res, refresh)

    return res.redirect(`${frontendOrigin()}/oauth/callback?success=1`)
  } catch (e) {
    return redirectWithError(res, 400, e.message || 'LinkedIn OAuth failed')
  }
})

module.exports = router
