export const WELCOME_COUPON_CODE = 'WELCOME5'
export const WELCOME_COUPON_PERCENT = 5
export const PREPAID_DISCOUNT_CODE = 'PREPAID5'
export const PREPAID_DISCOUNT_PERCENT = 5

const roundCurrency = (value) => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100

export const normalizeCoupon = (coupon) => ({
  code: String(coupon?.code || '').trim().toUpperCase(),
  discountPercent: Math.max(0, Number(coupon?.discountPercent || 0)),
  applied: coupon?.applied === true,
  source: String(coupon?.source || '').trim(),
})

export const isWelcomeCouponActive = (coupon) => {
  const normalized = normalizeCoupon(coupon)
  return normalized.applied && normalized.code === WELCOME_COUPON_CODE && normalized.discountPercent > 0
}

export const getCouponDiscountAmount = (subtotal, coupon) => {
  const normalizedSubtotal = Math.max(0, Number(subtotal || 0))
  if (!isWelcomeCouponActive(coupon)) return 0
  const percent = normalizeCoupon(coupon).discountPercent
  return roundCurrency((normalizedSubtotal * percent) / 100)
}

export const isPrepaidPayment = (paymentMethod) => String(paymentMethod || '').trim().toUpperCase() === 'RAZORPAY'

export const getPrepaidDiscountAmount = (subtotal, paymentMethod) => {
  const normalizedSubtotal = Math.max(0, Number(subtotal || 0))
  if (!isPrepaidPayment(paymentMethod) || PREPAID_DISCOUNT_PERCENT <= 0) return 0
  return roundCurrency((normalizedSubtotal * PREPAID_DISCOUNT_PERCENT) / 100)
}

export const getCartTotals = ({ itemsPrice = 0, shippingPrice = 0, taxPrice = 0, coupon, paymentMethod = '' } = {}) => {
  const subtotal = roundCurrency(Number(itemsPrice || 0) + Number(shippingPrice || 0) + Number(taxPrice || 0))
  const discountAmount = getCouponDiscountAmount(subtotal, coupon)
  const prepaidDiscountAmount = getPrepaidDiscountAmount(subtotal, paymentMethod)
  const totalDiscountAmount = roundCurrency(discountAmount + prepaidDiscountAmount)
  const totalPrice = roundCurrency(Math.max(0, subtotal - totalDiscountAmount))

  return {
    subtotal,
    discountAmount,
    prepaidDiscountAmount,
    totalDiscountAmount,
    totalPrice,
  }
}
