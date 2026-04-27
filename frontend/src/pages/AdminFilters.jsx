import { useMemo, useState } from 'react'
import { api } from '../services/api'
import { useTaxonomy } from '../components/TaxonomyProvider'

const FILTER_GROUPS = [
  {
    id: 'purpose',
    title: 'Shop by purpose',
    description: 'Add new browse filters like gifting, rituals, wellness, or trade-specific uses.',
  },
  {
    id: 'family',
    title: 'Fragrance family',
    description: 'Add new scent families whenever your catalog grows into new profiles.',
  },
]

function AdminFilters() {
  const { purposes, families, refresh, loading } = useTaxonomy()
  const [drafts, setDrafts] = useState({ purpose: '', family: '' })
  const [savingGroup, setSavingGroup] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const termsByGroup = useMemo(
    () => ({
      purpose: purposes,
      family: families,
    }),
    [purposes, families]
  )

  const createFilter = async (group) => {
    const label = String(drafts[group] || '').trim()
    if (!label) {
      setError('Enter a filter name first.')
      return
    }

    try {
      setError('')
      setMessage('')
      setSavingGroup(group)
      const result = await api.createTaxonomyTerm({ group, label })
      await refresh()
      setDrafts((prev) => ({ ...prev, [group]: '' }))
      setMessage(result?.message || 'Filter saved.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingGroup('')
    }
  }

  return (
    <div className="bg-sand min-h-screen">
      <header className="px-6 pb-10 pt-12">
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-xs uppercase tracking-[0.35em] text-muted">Admin</p>
          <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">Product filters</h1>
          <p className="mt-3 max-w-3xl text-sm text-muted">
            Add new purpose and fragrance-family filters here. They will appear in the products filter panel and in the product form for tagging.
          </p>
        </div>
      </header>

      <section className="px-6 pb-16">
        <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-2">
          {FILTER_GROUPS.map((group) => (
            <div
              key={group.id}
              className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-black/10"
            >
              <p className="text-xs uppercase tracking-[0.35em] text-muted">{group.title}</p>
              <p className="mt-3 text-sm text-muted">{group.description}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {(termsByGroup[group.id] || []).map((term) => (
                  <span
                    key={term.id}
                    className="rounded-full border border-slate-200 bg-clay/60 px-4 py-2 text-xs font-semibold text-emberDark"
                  >
                    {term.label}
                  </span>
                ))}
                {!loading && (termsByGroup[group.id] || []).length === 0 ? (
                  <p className="text-sm text-muted">No filters yet.</p>
                ) : null}
              </div>

              <div className="mt-6 rounded-3xl border border-slate-200/80 bg-clay/50 p-4">
                <label className="text-sm font-semibold text-ink">Add new filter</label>
                <input
                  value={drafts[group.id]}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [group.id]: e.target.value }))}
                  placeholder={group.id === 'purpose' ? 'For Ayurveda rituals' : 'Smoky'}
                  className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/15"
                />
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted">Slug will be generated automatically.</p>
                  <button
                    type="button"
                    onClick={() => createFilter(group.id)}
                    disabled={savingGroup === group.id}
                    className="rounded-full bg-ember px-5 py-2 text-sm font-semibold text-white transition hover:bg-emberDark disabled:opacity-60"
                  >
                    {savingGroup === group.id ? 'Saving…' : 'Add filter'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(message || error) && (
          <div className="mx-auto mt-6 w-full max-w-6xl">
            {message ? (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {message}
              </p>
            ) : null}
            {error ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </p>
            ) : null}
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminFilters
