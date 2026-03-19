import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="min-h-screen bg-sand px-6 py-16">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200/80 bg-white p-10 shadow-lg shadow-black/10">
        <p className="text-xs uppercase tracking-[0.35em] text-muted">404</p>
        <h1 className="mt-4 font-display text-4xl text-ink md:text-5xl">Page not found</h1>
        <p className="mt-4 text-sm text-muted">
          This page isn’t available. You can return to the homepage.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/"
            className="rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white transition hover:bg-emberDark"
          >
            Go home
          </Link>
          <Link
            to="/products"
            className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-emberDark hover:border-gold/40"
          >
            Browse products
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
