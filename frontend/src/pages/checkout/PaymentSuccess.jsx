import { Link, useParams } from 'react-router-dom'
import { auth } from '../../services/api'
import { getLastOrderById } from '../../utils/orderStorage'

function PaymentSuccess() {
  const { id } = useParams()
  const user = auth.getUser()
  const order = getLastOrderById(id)
  const canViewOrder = !!user
  const isOnlinePayment = String(order?.paymentMethod || '').toUpperCase() === 'RAZORPAY'
  const orderId = order?.publicOrderId || id

  return (
    <div className="min-h-screen bg-sand px-6 py-16">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200/80 bg-white p-10 shadow-lg shadow-black/10">
        <p className="text-xs uppercase tracking-[0.35em] text-muted">{isOnlinePayment ? 'Payment' : 'Order'}</p>
        <h1 className="mt-4 font-display text-4xl text-ink md:text-5xl">
          {isOnlinePayment ? 'Payment successful' : 'Order placed successfully'}
        </h1>
        <p className="mt-4 text-sm text-muted">Your order is confirmed.</p>
        <div className="mt-6 rounded-2xl border border-slate-200/80 bg-clay/50 p-4 text-sm text-ink">
          Order ID: <span className="font-semibold">{orderId}</span>
        </div>
        {!canViewOrder && order?.shippingAddress?.email ? (
          <p className="mt-4 text-sm text-muted">
            Confirmation will follow on <span className="font-semibold text-ink">{order.shippingAddress.email}</span>.
          </p>
        ) : null}
        {!canViewOrder ? (
          <p className="mt-3 text-sm text-muted">
            Keep this order ID safe. You can use it later on the <span className="font-semibold text-ink">Track Order</span> page.
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          {canViewOrder ? (
            <Link
              to={`/order/${id}`}
              className="rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white transition hover:bg-emberDark"
            >
              View order
            </Link>
          ) : null}
          <Link
            to="/track-order"
            className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-emberDark hover:border-gold/40"
          >
            Track order
          </Link>
          <Link
            to="/products"
            className={`rounded-full px-6 py-3 text-sm font-semibold transition ${canViewOrder ? 'border border-slate-200 bg-white text-emberDark hover:border-gold/40' : 'bg-ember text-white hover:bg-emberDark'}`}
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess
