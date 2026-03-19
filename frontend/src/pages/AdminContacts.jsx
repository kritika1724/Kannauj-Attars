import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

function AdminContacts() {
  const [data, setData] = useState({ messages: [], page: 1, pages: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setError('')
        const res = await api.getContactMessages({ page, limit: 20 })
        setData(res)
      } catch (e) {
        setError(e.message || 'Request failed')
      }
    }
    load()
  }, [page])

  const markRead = async (id) => {
    try {
      setBusyId(id)
      const updated = await api.markContactRead(id)
      setData((prev) => ({
        ...prev,
        messages: (prev.messages || []).map((m) => (m._id === id ? updated : m)),
      }))
    } catch (e) {
      setError(e.message || 'Request failed')
    } finally {
      setBusyId('')
    }
  }

  const remove = async (id) => {
    const ok = window.confirm('Delete this message?')
    if (!ok) return

    try {
      setBusyId(id)
      await api.deleteContactMessage(id)
      setData((prev) => ({
        ...prev,
        total: Math.max(0, (prev.total || 0) - 1),
        messages: (prev.messages || []).filter((m) => m._id !== id),
      }))
    } catch (e) {
      setError(e.message || 'Request failed')
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="bg-sand min-h-screen">
      <header className="px-6 pb-10 pt-12">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-muted">Admin</p>
            <h1 className="mt-4 font-display text-4xl text-ink md:text-5xl">Contact Requests</h1>
            <p className="mt-3 text-sm text-muted">All inquiries submitted from the Contact page.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin"
              className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-emberDark hover:border-gold/40"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/orders"
              className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-emberDark hover:border-gold/40"
            >
              Orders
            </Link>
            <Link
              to="/admin/products"
              className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-emberDark hover:border-gold/40"
            >
              Products
            </Link>
          </div>
        </div>
      </header>

      <section className="px-6 pb-16">
        <div className="mx-auto w-full max-w-6xl">
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-black/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-ink">
                Total: <span className="text-emberDark">{data.total ?? 0}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-emberDark disabled:opacity-50"
                >
                  Prev
                </button>
                <p className="text-xs font-semibold text-muted">
                  Page {page} / {data.pages || 1}
                </p>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(data.pages || 1, p + 1))}
                  disabled={page >= (data.pages || 1)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-emberDark disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {(data.messages || []).map((m) => (
                <article
                  key={m._id}
                  className="rounded-2xl border border-slate-200/80 bg-clay/60 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs uppercase tracking-[0.35em] text-muted">
                          {m.status || 'new'}
                        </p>
                        {(m.status || 'new') === 'new' ? (
                          <span className="inline-flex items-center rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                            NEW
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-ink">{m.name}</h3>
                      <p className="mt-1 text-sm text-muted">{m.email}</p>
                      <p className="mt-2 text-xs text-muted">
                        {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busyId === m._id || m.status !== 'new'}
                        onClick={() => markRead(m._id)}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-emberDark disabled:opacity-50"
                      >
                        Mark read
                      </button>
                      <button
                        type="button"
                        disabled={busyId === m._id}
                        onClick={() => remove(m._id)}
                        className="rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white p-4">
                    <p className="whitespace-pre-wrap text-sm text-ink">{m.message}</p>
                  </div>
                </article>
              ))}

              {(data.messages || []).length === 0 ? (
                <p className="text-sm text-muted">No contact requests yet.</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AdminContacts
