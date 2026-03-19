const WISHLIST_NS = 'wishlist:v1'

export const wishlistKeyFor = (userId) => `${WISHLIST_NS}:${String(userId || '').trim()}`

export const loadWishlistForUser = (userId, fallback) => {
  try {
    const key = wishlistKeyFor(userId)
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : fallback
  } catch {
    return fallback
  }
}

export const saveWishlistForUser = (userId, snapshot) => {
  try {
    if (!userId) return
    const key = wishlistKeyFor(userId)
    localStorage.setItem(key, JSON.stringify(snapshot))
  } catch {
    // ignore
  }
}

