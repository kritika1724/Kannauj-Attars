import { Navigate } from 'react-router-dom'
import { auth } from '../services/api'
import { useEffect, useState } from 'react'

function ProtectedRoute({ children, adminOnly = false }) {
  const [boot, setBoot] = useState(auth.isBootstrapped())
  const user = auth.getUser()

  useEffect(() => {
    const onBoot = () => setBoot(true)
    window.addEventListener('authboot', onBoot)
    return () => window.removeEventListener('authboot', onBoot)
  }, [])

  // Avoid redirect flicker before cookie-based refresh has a chance to run.
  if (!boot && !user) {
    return null
  }

  if (!user) {
    return <Navigate to="/account" replace />
  }

  // Strict check: only literal boolean true is treated as admin.
  if (adminOnly && user.isAdmin !== true) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
