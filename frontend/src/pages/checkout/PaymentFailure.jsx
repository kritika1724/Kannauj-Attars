import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, auth } from '../../services/api'
import { openRazorpayCheckout } from '../../utils/razorpay'

function PaymentFailure() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [message, setMessage] = useState('Payment was not completed.')
  const user = auth.getUser()

  useEffect(() => {
    ;(async () => {
      try {
        const data = await api.getOrder(id)
        setOrder(data)
      } catch (e) {
        setMessage(e.message)
      }
    })()
  }, [id])

  const retry = async () => {
    if (!order) return
    try {
      const rzp = await api.createRazorpayOrder(order._id)
      await openRazorpayCheckout({
        key: rzp.keyId,
        razorpayOrderId: rzp.razorpayOrderId,
        amount: rzp.amount,
        currency: rzp.currency,
        name: 'Kannauj Attars',
        description: `Order ${order._id}`,
        prefill: {
          name: order?.shippingAddress?.fullName || user?.name || '',
          email: user?.email || '',
          contact: order?.shippingAddress?.phone || '',
        },
        themeColor: '#111B3A',
        onSuccess: async (response) => {
          await api.verifyRazorpayPayment({ orderId: order._id, ...response })
          window.location.href = `/checkout/success/${order._id}`
        },
        onDismiss: () => {
          setMessage('Payment cancelled. You can retry anytime.')
        },
      })
    } catch (e) {
      setMessage(e.message)
    }
  }

  return (
    <div className="min-h-screen bg-sand px-6 py-16">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200/80 bg-white p-10 shadow-lg shadow-black/10">
        <p className="text-xs uppercase tracking-[0.35em] text-muted">Payment</p>
        <h1 className="mt-4 font-display text-4xl text-ink md:text-5xl">Payment not completed</h1>
        <p className="mt-4 text-sm text-muted">{message}</p>

        <div className="mt-6 rounded-2xl border border-slate-200/80 bg-clay/50 p-4 text-sm text-ink">
          Order: <span className="font-semibold">{id}</span>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={retry}
            disabled={!order || order?.isPaid}
            className="rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white transition hover:bg-emberDark disabled:opacity-60"
          >
            Retry payment
          </button>
          <Link
            to={`/order/${id}`}
            className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-emberDark hover:border-gold/40"
          >
            View order
          </Link>
          <Link
            to="/products"
            className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-emberDark hover:border-gold/40"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PaymentFailure

