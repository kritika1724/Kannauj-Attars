const CART_NS = 'cart:v1'

export const cartKeyFor = (userId) => `${CART_NS}:${String(userId || 'guest').trim() || 'guest'}`

export const loadCartForUser = (userId, fallback) => {
  try {
    const key = cartKeyFor(userId)
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : fallback
  } catch {
    return fallback
  }
}

export const saveCartForUser = (userId, snapshot) => {
  try {
    const key = cartKeyFor(userId)
    localStorage.setItem(key, JSON.stringify(snapshot))
  } catch {
    // ignore
  }
}
