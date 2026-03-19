const resolveAdminEmail = () => {
  const raw = process.env.ADMIN_EMAIL || process.env.ADMIN_ID || ''
  const email = String(raw).trim().toLowerCase()
  return email
}

const isAdminEmail = (email) => {
  const adminEmail = resolveAdminEmail()
  if (!adminEmail) return false
  return String(email || '').trim().toLowerCase() === adminEmail
}

module.exports = { resolveAdminEmail, isAdminEmail }

