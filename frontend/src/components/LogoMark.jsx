import { useMemo } from 'react'
import { useSiteAssets } from './SiteAssetsProvider'
import { toAssetUrl } from '../utils/media'

function LogoMark({ className = '' }) {
  const { assets } = useSiteAssets()

  const url = assets?.['site.logo'] || ''
  const src = useMemo(() => (url ? toAssetUrl(url, import.meta.env.VITE_API_ASSET) : ''), [url])

  if (src) {
    return (
      <div
        className={`relative grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-gold/25 bg-white shadow-sm ${className}`}
        aria-label="Kannauj Attars logo"
        title="Kannauj Attars"
      >
        <img src={src} alt="Kannauj Attars" className="h-full w-full object-contain p-1.5" />
      </div>
    )
  }

  // Fallback: premium seal-style monogram (until you upload a real logo)
  return (
    <div
      className={`relative grid h-11 w-11 place-items-center rounded-full border border-gold/30 bg-white shadow-sm ${className}`}
      aria-label="Kannauj Attars logo"
      title="Kannauj Attars"
    >
      <div className="absolute inset-1 rounded-full bg-[radial-gradient(circle_at_top,rgba(201,162,74,0.26),rgba(255,255,255,0.94))]" />
      <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_180deg,rgba(201,162,74,0.08),rgba(17,27,58,0.06),rgba(201,162,74,0.10))] opacity-60" />
      <span className="relative font-display text-[12px] tracking-[0.22em] text-ink">
        K<span className="mx-0.5 text-gold">•</span>A
      </span>
    </div>
  )
}

export default LogoMark

