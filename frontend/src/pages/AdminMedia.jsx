import { useEffect, useMemo, useState } from 'react'
import { toAssetUrl } from '../utils/media'
import { useSiteAssets } from '../components/SiteAssetsProvider'
import { SITE_ASSET_KEYS } from '../config/siteAssets'

function AdminMedia() {
  const { assets, refresh, uploadAndSetAsset, deleteAssetKey } = useSiteAssets()
  const [message, setMessage] = useState('')
  const [busyKey, setBusyKey] = useState('')

  const rows = useMemo(
    () =>
      SITE_ASSET_KEYS.map((k) => ({
        ...k,
        url: assets[k.key] || '',
      })),
    [assets]
  )

  useEffect(() => {
    refresh()
  }, [refresh])

  const uploadAndSet = async (key, file) => {
    setBusyKey(key)
    setMessage('')
    try {
      await uploadAndSetAsset(key, file)
      setMessage('Image updated.')
    } catch (e) {
      setMessage(e.message)
    } finally {
      setBusyKey('')
    }
  }

  const clear = async (key) => {
    if (!window.confirm('Remove this image?')) return
    setBusyKey(key)
    setMessage('')
    try {
      await deleteAssetKey(key)
      setMessage('Image removed.')
    } catch (e) {
      setMessage(e.message)
    } finally {
      setBusyKey('')
    }
  }

  return (
    <div className="bg-sand min-h-screen">
      <header className="px-6 pb-10 pt-12">
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-xs uppercase tracking-[0.35em] text-muted">Admin</p>
          <h1 className="mt-4 font-display text-4xl text-ink md:text-5xl">Website Images</h1>
          <p className="mt-3 text-sm text-muted">
            Upload/replace images used across Home and Gallery. Product images remain in Products.
          </p>
          {message && <p className="mt-4 text-sm font-semibold text-emberDark">{message}</p>}
        </div>
      </header>

      <section className="px-6 pb-16">
        <div className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-black/10">
          <div className="grid gap-5">
            {rows.map((row) => (
              <div
                key={row.key}
                className="grid gap-4 rounded-2xl border border-slate-200/80 bg-clay/50 p-4 md:grid-cols-[220px_1fr_auto]"
              >
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  {row.url ? (
                    <img
                      src={toAssetUrl(row.url, import.meta.env.VITE_API_ASSET)}
                      alt={row.label}
                      className="h-44 w-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-44 w-full items-center justify-center text-xs font-semibold text-muted">
                      No image
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-ink">{row.label}</p>
                  <p className="mt-1 text-xs text-muted">{row.key}</p>
                  <div className="mt-4">
                    <label className="text-xs font-semibold text-muted">Upload new image</label>
                    <input
                      type="file"
                      disabled={busyKey === row.key}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) uploadAndSet(row.key, file)
                      }}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink file:mr-4 file:rounded-full file:border-0 file:bg-ember file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-emberDark disabled:opacity-60"
                    />
                    <p className="mt-2 text-[11px] text-muted">
                      Tip: JPG/PNG works best. HEIC may not display in browsers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 md:justify-end">
                  <button
                    type="button"
                    disabled={!row.url || busyKey === row.key}
                    onClick={() => clear(row.key)}
                    className="rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default AdminMedia
