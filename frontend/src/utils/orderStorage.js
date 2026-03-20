const LAST_ORDER_KEY = 'checkout:lastOrder'

export const saveLastOrder = (order) => {
  try {
    if (!order?._id) return
    localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order))
  } catch {
    // ignore
  }
}

export const getLastOrder = () => {
  try {
    const raw = localStorage.getItem(LAST_ORDER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export const getLastOrderById = (id) => {
  const order = getLastOrder()
  return order?._id === id ? order : null
}
