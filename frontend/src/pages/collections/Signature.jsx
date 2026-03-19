import { Link } from 'react-router-dom'
import AdminAssetImage from '../../components/AdminAssetImage'

function Signature() {
  return (
    <div className="bg-sand">
      <header className="px-6 pb-10 pt-12">
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-xs uppercase tracking-[0.35em] text-muted">Collections</p>
          <h1 className="mt-4 font-display text-4xl text-ink md:text-5xl">Signature Attars</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Clean, balanced blends designed for everyday elegance. Smooth projection, long wear,
            and a refined finish.
          </p>
        </div>
      </header>

      <section className="px-6 pb-16">
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
	          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-black/10">
              <AdminAssetImage
                assetKey="collections.signature.hero"
                className="aspect-[16/9] w-full rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,rgba(201,162,74,0.18),rgba(255,246,236,0.95),rgba(17,27,58,0.10))]"
                imgClassName="p-2"
                defaultAspect="16 / 9"
                fit="contain"
              />
	            <h2 className="mt-6 text-lg font-semibold text-ink">What to expect</h2>
	            <ul className="mt-3 space-y-2 text-sm text-muted">
	              <li>Soft opening, steady heart, clean drydown</li>
              <li>Office-friendly and daily wear</li>
              <li>Gift-worthy and easy to love</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-clay/70 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">Suggested scent profile</h2>
            <div className="mt-4 grid gap-4">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-muted">Top</p>
                <p className="mt-2 text-sm text-muted">Citrus, airy florals, light spices (placeholder)</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-muted">Heart</p>
                <p className="mt-2 text-sm text-muted">Rose, jasmine, soft woods (placeholder)</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-muted">Base</p>
                <p className="mt-2 text-sm text-muted">Amber, musk, sandalwood (placeholder)</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="rounded-full bg-ember px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emberDark"
              >
                Browse products
              </Link>
              <Link
                to="/contact"
                className="rounded-full border border-gold/25 bg-white px-5 py-2 text-sm font-semibold text-ink"
              >
                Wholesale inquiry
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-midnight px-6 py-14 text-white">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="font-display text-2xl">Kannauj Attars</h2>
          <p className="mt-2 text-sm text-white/75">Signature blends with a heritage soul.</p>
        </div>
      </footer>
    </div>
  )
}

export default Signature
