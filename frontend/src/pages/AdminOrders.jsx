import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

const STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const statusPill = (status) => {
  const s = status || 'pending'
  if (s === 'cancelled') return 'bg-red-600 text-white'
  if (s === 'delivered') return 'bg-emerald-600 text-white'
  if (s === 'shipped') return 'bg-amber-500 text-white'
  if (s === 'confirmed') return 'bg-ember text-white'
  return 'bg-white text-emberDark border border-red-200'
}

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState('')
  const [deletingId, setDeletingId] = useState('')
  const [statusDraft, setStatusDraft] = useState({})

  const pendingCount = orders.filter((o) => (o.status || 'pending') === 'pending').length

  const load = async () => {
    try {
      const data = await api.getAllOrders()
      setOrders(data || [])
      setStatusDraft(
        (data || []).reduce((acc, o) => {
          acc[o._id] = o.status
          return acc
        }, {})
      )
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    load()
    const id = window.setInterval(load, 15000)
    return () => window.clearInterval(id)
  }, [])

  const saveStatus = async (id) => {
    setSavingId(id)
    setError('')
    try {
      const updated = await api.updateOrderStatus(id, statusDraft[id])
      setOrders((prev) => prev.map((o) => (o._id === id ? updated : o)))
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingId('')
    }
  }

  const removeOrder = async (id) => {
    const ok = window.confirm('Delete this order permanently?')
    if (!ok) return

    setDeletingId(id)
    setError('')
    try {
      await api.deleteOrder(id)
      setOrders((prev) => prev.filter((order) => order._id !== id))
      setStatusDraft((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId('')
    }
  }

  return (
    <div className="bg-sand min-h-screen">
      <header className="px-6 pb-10 pt-12">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-muted">Admin</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-4xl text-ink md:text-5xl">Orders</h1>
              {pendingCount > 0 ? (
                <span className="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                  NEW {pendingCount}
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm text-muted">Update status for pending and shipped orders.</p>
          </div>
          <Link
            to="/admin"
            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-emberDark hover:border-gold/40"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      <section className="px-6 pb-16">
        <div className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-black/10">
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

          {orders.length === 0 ? (
            <p className="text-sm text-muted">No orders yet.</p>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="rounded-2xl border border-slate-200/80 bg-clay/60 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-muted">Order ID</p>
                      <p className="text-sm font-semibold text-ink">{order.publicOrderId || order._id}</p>
                      <p className="mt-1 text-xs text-muted">
                        {order.user?.name
                          ? `${order.user.name} • ${order.user.email}`
                          : `${order.shippingAddress?.fullName || 'Guest'} • ${order.shippingAddress?.email || 'No email'}`}
                      </p>
                      {order.shippingAddress?.whatsapp ? (
                        <p className="mt-1 text-xs text-muted">WhatsApp: {order.shippingAddress.whatsapp}</p>
                      ) : null}
                      <p className="mt-1 text-xs text-muted">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-ink">₹{order.totalPrice}</p>
                      <p className="mt-1 text-xs text-muted">{order.paymentMethod}</p>
                      <p className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusPill(order.status)}`}>
                        {(order.status || 'pending').toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-semibold text-muted">Status</label>
                      <select
                        value={statusDraft[order._id] || order.status}
                        onChange={(e) =>
                          setStatusDraft((prev) => ({ ...prev, [order._id]: e.target.value }))
                        }
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink"
                      >
                        {STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        to={`/order/${order._id}`}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-emberDark hover:border-gold/40"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={() => saveStatus(order._id)}
                        disabled={savingId === order._id || deletingId === order._id}
                        className="rounded-full bg-ember px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        {savingId === order._id ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeOrder(order._id)}
                        disabled={deletingId === order._id || savingId === order._id}
                        className="rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 disabled:opacity-50"
                      >
                        {deletingId === order._id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default AdminOrders
