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

const registerSchema = yup.object({
  name: yup.string().required('Name is required.'),
  email: yup.string().email('Enter a valid email.').required('Email is required.'),
  password: yup.string().min(6, 'Minimum 6 characters.').required('Password is required.'),
})

function Account() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState('login')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(auth.getUser())

  const hadPendingCartIntent = () => {
    try {
      return !!sessionStorage.getItem('pendingAddToCart')
    } catch {
      return false
    }
  }

  const hadPendingWishlistIntent = () => {
    try {
      return !!sessionStorage.getItem('pendingAddToWishlist')
    } catch {
      return false
    }
  }

  useEffect(() => {
    if (location?.state?.intent === 'cart' && !user) {
      setMessage('Please sign in or create an account to add items to your cart.')
    }
    if (location?.state?.intent === 'wishlist' && !user) {
      setMessage('Please sign in or create an account to save items to your wishlist.')
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

  const {
    register: registerRegister,
    handleSubmit: handleRegister,
    formState: { errors: registerErrors },
  } = useForm({ resolver: yupResolver(registerSchema) })

  const submitLogin = async (data) => {
    try {
      // IMPORTANT: read intent BEFORE auth.setSession(), because CartBootstrap
      // consumes/clears pendingAddToCart synchronously on the authchange event.
      const hadPendingCart = hadPendingCartIntent()
      const hadPendingWishlist = hadPendingWishlistIntent()
      const response = await api.login(data)
      auth.setSession(response)
      setUser(response.user)
      setMessage('Logged in successfully.')
      if (hadPendingCart) {
        navigate('/cart')
      } else if (hadPendingWishlist) {
        navigate('/wishlist')
      } else {
        navigate(response.user?.isAdmin === true ? '/admin' : '/account/orders')
      }
    } catch (error) {
      setMessage(error.message)
    }
  }

  const submitRegister = async (data) => {
    try {
      const hadPendingCart = hadPendingCartIntent()
      const hadPendingWishlist = hadPendingWishlistIntent()
      const response = await api.register(data)
      auth.setSession(response)
      setUser(response.user)
      setMessage('Account created successfully.')
      if (hadPendingCart) {
        navigate('/cart')
      } else if (hadPendingWishlist) {
        navigate('/wishlist')
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
            {user ? 'Welcome back' : 'Sign in or create an account'}
          </h1>
          <p className="mt-4 text-lg text-muted">
            {user
              ? `Hello, ${user.name}.`
              : 'Log in to leave reviews and track your orders.'}
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
                  {!user.isAdmin ? (
                    <Link
                      to="/wishlist"
                      className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-emberDark hover:border-gold/40"
                    >
                      Wishlist
                    </Link>
                  ) : null}
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
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      mode === 'login'
                        ? 'bg-ember text-white'
                        : 'bg-white text-ink border border-slate-200'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      mode === 'register'
                        ? 'bg-ember text-white'
                        : 'bg-white text-ink border border-slate-200'
                    }`}
                  >
                    Register
                  </button>
                </div>

                {mode === 'login' ? (
                  <form onSubmit={handleLogin(submitLogin)} className="mt-6 space-y-5">
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
                ) : (
                  <form onSubmit={handleRegister(submitRegister)} className="mt-6 space-y-5">
                    <div>
                      <label className="text-sm font-semibold text-ink">Full name</label>
                      <input
                        {...registerRegister('name')}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
                        placeholder="Your name"
                      />
                      {registerErrors.name && (
                        <p className="mt-2 text-xs text-red-600">{registerErrors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-ink">Email</label>
                      <input
                        {...registerRegister('email')}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
                        placeholder="you@email.com"
                      />
                      {registerErrors.email && (
                        <p className="mt-2 text-xs text-red-600">{registerErrors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-ink">Password</label>
                      <input
                        {...registerRegister('password')}
                        type="password"
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
                        placeholder="••••••••"
                      />
                      {registerErrors.password && (
                        <p className="mt-2 text-xs text-red-600">{registerErrors.password.message}</p>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white"
                    >
                      Create account
                    </button>
                  </form>
                )}
                {message && <p className="mt-4 text-sm font-semibold text-emberDark">{message}</p>}

                <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-5">
                  <p className="text-xs uppercase tracking-[0.35em] text-muted">Quick sign-in</p>
                  <p className="mt-2 text-sm text-muted">
                    No separate registration needed — social sign-in will create your account automatically.
                  </p>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <a
                      href="/api/oauth/google/start"
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-emberDark hover:border-gold/40"
                    >
                      Continue with Google
                    </a>
                    <a
                      href="/api/oauth/github/start"
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-emberDark hover:border-gold/40"
                    >
                      Continue with GitHub
                    </a>
                    <a
                      href="/api/oauth/linkedin/start"
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-emberDark hover:border-gold/40"
                    >
                      Continue with LinkedIn
                    </a>
                  </div>
                  <p className="mt-3 text-[11px] text-muted">
                    Note: Social login requires provider keys in the backend `.env` file.
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-lg shadow-black/10">
            <h2 className="text-xl font-semibold text-ink">Why create an account?</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li>Leave verified reviews on products.</li>
              <li>Track orders and delivery updates.</li>
              <li>Faster inquiries for custom or bulk orders.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Account
