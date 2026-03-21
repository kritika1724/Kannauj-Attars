import { BrowserRouter, Routes, Route, NavLink, Navigate, Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { auth } from './services/api'
import { FiMenu, FiX } from 'react-icons/fi'

import Home from './pages/Home'
import Contact from './pages/Contact'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import TrackOrder from './pages/TrackOrder'
import Account from './pages/Account'
import OAuthCallback from './pages/OAuthCallback'
import NotFound from './pages/NotFound'
import CustomBlends from './pages/CustomBlends'
import Signature from './pages/collections/Signature'
import Heritage from './pages/collections/Heritage'
import Gallery from './pages/Gallery'
import CreateBlend from './pages/CreateBlend'
import DiscoveryQuiz from './pages/DiscoveryQuiz'
import Knowledge from './pages/Knowledge'
import KnowledgeArticle from './pages/KnowledgeArticle'
import Ceo from './pages/Ceo'

import Cart from './pages/Cart'
import Shipping from './pages/checkout/Shipping'
import Payment from './pages/checkout/Payment'
import PlaceOrder from './pages/checkout/PlaceOrder'
import PaymentSuccess from './pages/checkout/PaymentSuccess'
import PaymentFailure from './pages/checkout/PaymentFailure'
import OrderDetail from './pages/OrderDetail'
import MyOrders from './pages/MyOrders'

import AdminDashboard from './pages/AdminDashboard'
import AdminOrders from './pages/AdminOrders'
import AdminProducts from './pages/AdminProducts'
import AdminProductForm from './pages/AdminProductForm'
import AdminMedia from './pages/AdminMedia'
import AdminContacts from './pages/AdminContacts'

import ProtectedRoute from './components/ProtectedRoute'
import LogoMark from './components/LogoMark'

const navLinkClass = ({ isActive }) =>
  `relative text-sm font-semibold tracking-wide transition ${
    isActive
      ? 'text-ink after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:bg-[linear-gradient(90deg,rgba(201,162,74,1),rgba(201,162,74,0.25))] after:content-[""]'
      : 'text-muted hover:text-ink hover:-translate-y-0.5'
  }`

const mobileNavLinkClass = ({ isActive }) =>
  `flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
    isActive
      ? 'border-gold/35 bg-clay/70 text-ink'
      : 'border-slate-200 bg-white text-emberDark hover:border-gold/35 hover:bg-clay/60'
  }`

const adminNavLinkClass = ({ isActive }) =>
  `rounded-full border px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? 'border-gold/40 bg-gold text-midnight'
      : 'border-white/10 bg-white/5 text-white hover:border-gold/35 hover:bg-white/10'
  }`

function AppShell() {
  const location = useLocation()
  const cartCount = useSelector((state) => state.cart.items.reduce((sum, i) => sum + i.qty, 0))
  const [user, setUser] = useState(auth.getUser())
  const isAdmin = user?.isAdmin === true
  const isLoggedIn = !!user
  const [mobileOpen, setMobileOpen] = useState(false)
  const inAdminArea = isAdmin && location.pathname.startsWith('/admin')

  useEffect(() => {
    const onAuth = () => setUser(auth.getUser())
    window.addEventListener('authchange', onAuth)
    return () => window.removeEventListener('authchange', onAuth)
  }, [])

  useEffect(() => {
    // Close mobile menu on md+ screens.
    try {
      const mq = window.matchMedia('(min-width: 768px)')
      const onChange = () => {
        if (mq.matches) setMobileOpen(false)
      }
      onChange()
      if (mq.addEventListener) mq.addEventListener('change', onChange)
      else mq.addListener(onChange)
      return () => {
        if (mq.removeEventListener) mq.removeEventListener('change', onChange)
        else mq.removeListener(onChange)
      }
    } catch {
      return undefined
    }
  }, [])

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  useEffect(() => {
    if (inAdminArea) {
      setMobileOpen(false)
    }
  }, [inAdminArea])

  return (
    <div className="min-h-screen">
      {inAdminArea ? (
        <header className="sticky top-0 z-20 border-b border-gold/20 bg-[linear-gradient(135deg,#070B18,#111B3A)] shadow-[0_18px_40px_rgba(7,11,24,0.35)]">
          <div className="ka-container flex flex-wrap items-center justify-between gap-4 py-4">
            <Link to="/admin" className="flex min-w-0 items-center gap-3" aria-label="Go to admin dashboard">
              <LogoMark />
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-display text-xl tracking-wide text-white sm:text-2xl">
                  Kannauj Attars <span className="text-gold">Admin</span>
                </span>
                <span className="truncate text-xs uppercase tracking-[0.3em] text-white/65">
                  Dashboard access
                </span>
              </div>
            </Link>

            <nav className="flex flex-wrap items-center gap-2">
              <NavLink to="/admin" end className={adminNavLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/admin/orders" className={adminNavLinkClass}>
                Orders
              </NavLink>
              <NavLink to="/admin/products" className={adminNavLinkClass}>
                Products
              </NavLink>
              <NavLink to="/admin/media" className={adminNavLinkClass}>
                Website Images
              </NavLink>
              <NavLink to="/admin/contacts" className={adminNavLinkClass}>
                Contacts
              </NavLink>
              <Link
                to="/"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-gold/35 hover:bg-white/10"
              >
                View site
              </Link>
            </nav>
          </div>
        </header>
      ) : (
        <header className="sticky top-0 z-20 relative border-b border-gold/20 bg-white/90 shadow-[0_18px_40px_rgba(17,27,58,0.12)] backdrop-blur-xl after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-[linear-gradient(90deg,rgba(201,162,74,0),rgba(201,162,74,0.75),rgba(201,162,74,0))] after:content-['']">
          <div className="ka-container flex items-center justify-between gap-4 py-4">
            <Link
              to="/"
              onClick={() => {
                setMobileOpen(false)
                try {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                } catch {
                  // ignore
                }
              }}
              className="group flex flex-1 min-w-0 items-center gap-3 md:flex-none"
              aria-label="Go to home"
              title="Kannauj Attars"
            >
              <LogoMark />
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-display text-xl tracking-wide text-ink sm:text-2xl">
                  Kannauj Attars <span className="text-gold">•</span>
                </span>
                <span className="truncate text-xs uppercase tracking-[0.3em] text-muted">Since 1998</span>
              </div>
            </Link>

            <nav className="hidden items-center gap-5 md:flex">
              <NavLink to="/" end className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/products" className={navLinkClass}>
                Products
              </NavLink>
              {!isAdmin ? (
                <NavLink to="/cart" className={navLinkClass}>
                  <span className="inline-flex items-center gap-2">
                    Cart
                    {cartCount > 0 && (
                      <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-ember px-2 py-0.5 text-[10px] font-semibold text-white">
                        {cartCount}
                      </span>
                    )}
                  </span>
                </NavLink>
              ) : (
                isAdmin ? (
                  <NavLink to="/admin" className={navLinkClass}>
                    Admin
                  </NavLink>
                ) : null
              )}
              {!isAdmin ? (
                <NavLink to="/track-order" className={navLinkClass}>
                  Track Order
                </NavLink>
              ) : null}
              {!isAdmin ? (
                <NavLink to="/contact" className={navLinkClass}>
                  Contact
                </NavLink>
              ) : null}
              <NavLink to="/account" className={navLinkClass}>
                {user ? 'Account' : 'Login'}
              </NavLink>
            </nav>

            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-3 text-emberDark shadow-sm transition hover:border-gold/40 hover:bg-clay/50"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>
          </div>

          {mobileOpen ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10 bg-black/40 backdrop-blur-[2px]"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              />
              <div
                id="mobile-nav"
                className="md:hidden absolute inset-x-0 top-full z-20 border-b border-gold/15 bg-white/95 shadow-soft backdrop-blur-xl"
              >
                <div className="ka-container py-4">
                  <div className="grid gap-2">
                    <NavLink to="/" end className={mobileNavLinkClass} onClick={() => setMobileOpen(false)}>
                      Home
                    </NavLink>
                    <NavLink to="/products" className={mobileNavLinkClass} onClick={() => setMobileOpen(false)}>
                      Products
                    </NavLink>

                    {!isAdmin ? (
                      <NavLink to="/cart" className={mobileNavLinkClass} onClick={() => setMobileOpen(false)}>
                        <span className="inline-flex items-center gap-2">
                          Cart
                          {cartCount > 0 ? (
                            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-ember px-2 py-0.5 text-[10px] font-semibold text-white">
                              {cartCount}
                            </span>
                          ) : null}
                        </span>
                      </NavLink>
                    ) : isAdmin ? (
                      <NavLink to="/admin" className={mobileNavLinkClass} onClick={() => setMobileOpen(false)}>
                        Admin
                      </NavLink>
                    ) : null}

                    {!isAdmin ? (
                      <NavLink to="/track-order" className={mobileNavLinkClass} onClick={() => setMobileOpen(false)}>
                        Track Order
                      </NavLink>
                    ) : null}

                    {!isAdmin ? (
                      <NavLink to="/contact" className={mobileNavLinkClass} onClick={() => setMobileOpen(false)}>
                        Contact
                      </NavLink>
                    ) : null}

                    <NavLink to="/account" className={mobileNavLinkClass} onClick={() => setMobileOpen(false)}>
                      {user ? 'Account' : 'Login'}
                    </NavLink>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </header>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<Navigate to="/" replace />} />
        <Route path="/explore" element={<Navigate to="/" replace />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/collections/signature" element={<Signature />} />
        <Route path="/collections/heritage" element={<Heritage />} />
        <Route path="/custom-blends" element={<CustomBlends />} />
        <Route path="/create-blend" element={<CreateBlend />} />
        <Route path="/discovery-quiz" element={<DiscoveryQuiz />} />
        <Route path="/knowledge" element={<Knowledge />} />
        <Route path="/knowledge/:slug" element={<KnowledgeArticle />} />
        <Route path="/ceo" element={<Ceo />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/account" element={<Account />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        <Route
          path="/account/orders"
          element={
            isAdmin ? (
              <Navigate to="/admin/orders" replace />
            ) : (
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            )
          }
        />
        <Route
          path="/cart"
          element={
            isAdmin ? (
              <Navigate to="/admin" replace />
            ) : (
              <Cart />
            )
          }
        />
        <Route
          path="/checkout/shipping"
          element={
            isAdmin ? (
              <Navigate to="/admin" replace />
            ) : (
              <Shipping />
            )
          }
        />
        <Route
          path="/checkout/payment"
          element={
            isAdmin ? (
              <Navigate to="/admin" replace />
            ) : (
              <Payment />
            )
          }
        />
        <Route
          path="/checkout/place-order"
          element={
            isAdmin ? (
              <Navigate to="/admin" replace />
            ) : (
              <PlaceOrder />
            )
          }
        />
        <Route
          path="/checkout/success/:id"
          element={
            isAdmin ? (
              <Navigate to="/admin/orders" replace />
            ) : (
              <PaymentSuccess />
            )
          }
        />
        <Route
          path="/checkout/failure/:id"
          element={
            isAdmin ? (
              <Navigate to="/admin/orders" replace />
            ) : (
              <PaymentFailure />
            )
          }
        />
        <Route
          path="/order/:id"
          element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute adminOnly>
              <AdminOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute adminOnly>
              <AdminProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/new"
          element={
            <ProtectedRoute adminOnly>
              <AdminProductForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/:id"
          element={
            <ProtectedRoute adminOnly>
              <AdminProductForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/media"
          element={
            <ProtectedRoute adminOnly>
              <AdminMedia />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/contacts"
          element={
            <ProtectedRoute adminOnly>
              <AdminContacts />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App
