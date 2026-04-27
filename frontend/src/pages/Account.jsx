import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { api, auth } from '../services/api'

const loginSchema = yup.object({
  email: yup.string().email('Enter a valid email.').required('Email is required.'),
  password: yup.string().required('Password is required.'),
})

function Account() {
  const navigate = useNavigate()
  const location = useLocation()
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(auth.getUser())

  const hadPendingCartIntent = () => {
    try {
      return !!sessionStorage.getItem('pendingAddToCart')
    } catch {
      return false
    }
  }

  useEffect(() => {
    if (location?.state?.intent === 'cart' && !user) {
      setMessage('Please sign in to add items to your cart.')
    }
  }, [location?.state?.intent, user])

  useEffect(() => {
    const onAuth = () => setUser(auth.getUser())
    window.addEventListener('authchange', onAuth)
    return () => window.removeEventListener('authchange', onAuth)
  }, [])

  const {
    register: registerLogin,
    handleSubmit: handleLogin,
    formState: { errors: loginErrors },
  } = useForm({ resolver: yupResolver(loginSchema) })

  const submitLogin = async (data) => {
    try {
      // IMPORTANT: read intent BEFORE auth.setSession(), because CartBootstrap
      // consumes/clears pendingAddToCart synchronously on the authchange event.
      const hadPendingCart = hadPendingCartIntent()
      const response = await api.login(data)
      auth.setSession(response)
      setUser(response.user)
      setMessage('Logged in successfully.')
      if (hadPendingCart) {
        navigate('/cart')
      } else {
        navigate(response.user?.isAdmin === true ? '/admin' : '/account/orders')
      }
    } catch (error) {
      setMessage(error.message)
    }
  }

  const logout = async () => {
    try {
      await api.sessionLogout()
    } catch {
      // ignore (still clear local state)
    }
    auth.clearSession()
    setUser(null)
    setMessage('Logged out.')
  }

  return (
    <div className="bg-sand">
      <header className="px-6 pb-12 pt-12">
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-xs uppercase tracking-[0.35em] text-muted">Account</p>
          <h1 className="mt-4 font-display text-4xl text-ink md:text-5xl">
            {user ? 'Welcome back' : 'Login to your account'}
          </h1>
          <p className="mt-4 text-lg text-muted">
            {user
              ? `Hello, ${user.name}.`
              : 'New account registration is currently closed.'}
          </p>
        </div>
      </header>

      <section className="bg-sand px-6 py-16">
        <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-slate-200/80 bg-clay/70 p-8 shadow-sm">
            {user ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
                  <p className="text-xs uppercase tracking-[0.35em] text-muted">Signed in as</p>
                  <p className="mt-2 text-lg font-semibold text-ink">{user.name}</p>
                  <p className="mt-1 text-sm text-muted">{user.email}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/account/orders"
                    className="rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white transition hover:bg-emberDark"
                  >
                    My orders
                  </Link>
                  <Link
                    to="/products"
                    className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-emberDark hover:border-gold/40"
                  >
                    Browse products
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-emberDark hover:border-gold/40"
                  >
                    Logout
                  </button>
                </div>

                {user.isAdmin === true && (
                  <Link
                    to="/admin"
                    className="inline-flex w-fit rounded-full border border-gold/25 bg-white px-5 py-2 text-sm font-semibold text-emberDark"
                  >
                    Go to admin dashboard →
                  </Link>
                )}

                {message && <p className="text-sm font-semibold text-emberDark">{message}</p>}
              </div>
            ) : (
              <>
                <form onSubmit={handleLogin(submitLogin)} className="mt-2 space-y-5">
                  <div>
                    <label className="text-sm font-semibold text-ink">Email</label>
                    <input
                      {...registerLogin('email')}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
                      placeholder="you@email.com"
                    />
                    {loginErrors.email && (
                      <p className="mt-2 text-xs text-red-600">{loginErrors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-ink">Password</label>
                    <input
                      {...registerLogin('password')}
                      type="password"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
                      placeholder="••••••••"
                    />
                    {loginErrors.password && (
                      <p className="mt-2 text-xs text-red-600">{loginErrors.password.message}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white"
                  >
                    Login
                  </button>
                </form>
                {message && <p className="mt-4 text-sm font-semibold text-emberDark">{message}</p>}
              </>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-lg shadow-black/10">
            <h2 className="text-xl font-semibold text-ink">Ordering without an account</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li>You can place an order without creating an account.</li>
              <li>We will share your order details on your WhatsApp number and email.</li>
              <li>You can track your order anytime using your Order ID.</li>
            </ul>
            <p className="mt-5 text-sm text-muted">
              New account registration is currently closed.
            </p>
            <Link
              to="/track-order"
              className="mt-5 inline-flex rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-emberDark hover:border-gold/40"
            >
              Track your order
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Account
