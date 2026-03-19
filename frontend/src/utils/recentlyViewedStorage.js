const RECENT_NS = 'recentlyViewed:v1'

export const recentKeyFor = (ownerId) => `${RECENT_NS}:${String(ownerId || 'guest').trim() || 'guest'}`

export const loadRecentFor = (ownerId, fallback) => {
  try {
    const key = recentKeyFor(ownerId)
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : fallback
  } catch {
    return fallback
  }
}

export const saveRecentFor = (ownerId, snapshot) => {
  try {
    const key = recentKeyFor(ownerId)
    localStorage.setItem(key, JSON.stringify(snapshot))
  } catch {
    // ignore
  }
}

