import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, auth } from '../services/api'

function OAuthCallback() {
  const navigate = useNavigate()
  const [message, setMessage] = useState('Signing you in...')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const error = params.get('error')

    if (error) {
      setMessage(error)
      setTimeout(() => navigate('/account', { replace: true }), 1200)
      return
    }

    ;(async () => {
      try {
        // Read intent BEFORE auth.setSession(), because CartBootstrap clears it on authchange.
        const hadPending = (() => {
          try {
            return !!sessionStorage.getItem('pendingAddToCart')
          } catch {
            return false
          }
        })()

        const refreshed = await api.sessionRefresh()
        auth.setSession(refreshed)
        if (refreshed?.user?.isAdmin === true) {
          navigate('/admin', { replace: true })
        } else if (hadPending) {
          navigate('/cart', { replace: true })
        } else {
          navigate('/account/orders', { replace: true })
        }
      } catch (e) {
        auth.clearSession()
        setMessage(e.message || 'OAuth sign-in failed')
        setTimeout(() => navigate('/account', { replace: true }), 1200)
      }
    })()
  }, [navigate])

  return (
    <div className="min-h-screen bg-sand px-6 py-16">
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-lg shadow-black/10">
        <p className="text-xs uppercase tracking-[0.35em] text-muted">Account</p>
        <h1 className="mt-4 font-display text-3xl text-ink">Please wait</h1>
        <p className="mt-4 text-sm font-semibold text-emberDark">{message}</p>
      </div>
    </div>
  )
}

export default OAuthCallback
