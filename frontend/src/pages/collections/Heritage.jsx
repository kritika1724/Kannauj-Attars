import { Link } from 'react-router-dom'
import AdminAssetImage from '../../components/AdminAssetImage'

function Heritage() {
  return (
    <div className="bg-sand">
      <header className="px-6 pb-10 pt-12">
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-xs uppercase tracking-[0.35em] text-muted">Collections</p>
          <h1 className="mt-4 font-display text-4xl text-ink md:text-5xl">Heritage Collection</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Traditional profiles inspired by classic Kannauj perfumery. Deeper, slower, and more
            nostalgic—made for people who prefer authentic character.
          </p>
        </div>
      </header>

      <section className="px-6 pb-16">
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-slate-200/80 bg-clay/70 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">Craft highlights</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li>Inspired by deg-bhapka distillation traditions</li>
              <li>Warm resins, woods, florals, and spices</li>
              <li>Ideal for evenings and special occasions</li>
            </ul>

            <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Note</p>
              <p className="mt-2 text-sm text-muted">
                We can add specific heritage formulas and raw material stories as you share them.
              </p>
            </div>
          </div>

	          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-black/10">
              <AdminAssetImage
                assetKey="collections.heritage.hero"
                className="aspect-[16/9] w-full rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,rgba(17,27,58,0.12),rgba(255,246,236,0.96),rgba(201,162,74,0.22))]"
                imgClassName="p-2"
                defaultAspect="16 / 9"
                fit="contain"
              />

	            <h2 className="mt-6 text-lg font-semibold text-ink">Best for</h2>
	            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 bg-clay/70 p-4">
                <p className="text-sm font-semibold text-ink">Festive wear</p>
                <p className="mt-2 text-sm text-muted">Deep, memorable trail (placeholder)</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-clay/70 p-4">
                <p className="text-sm font-semibold text-ink">Collectors</p>
                <p className="mt-2 text-sm text-muted">Authentic profiles and tradition (placeholder)</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="rounded-full bg-ember px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emberDark"
              >
                Explore products
              </Link>
              <Link
                to="/about"
                className="rounded-full border border-gold/25 bg-white px-5 py-2 text-sm font-semibold text-ink"
              >
                About Kannauj
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-midnight px-6 py-14 text-white">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="font-display text-2xl">Kannauj Attars</h2>
          <p className="mt-2 text-sm text-white/75">Heritage blends, modern presentation.</p>
        </div>
      </footer>
    </div>
  )
}

export default Heritage
