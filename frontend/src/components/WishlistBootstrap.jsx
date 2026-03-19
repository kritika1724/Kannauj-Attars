import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { addToWishlist, hydrateWishlist, DEFAULT_WISHLIST_STATE } from '../features/wishlistSlice'
import { loadWishlistForUser } from '../utils/wishlistStorage'
import { auth } from '../services/api'

const PENDING_KEY = 'pendingAddToWishlist'

const readPending = () => {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const clearPending = () => {
  try {
    sessionStorage.removeItem(PENDING_KEY)
  } catch {
    // ignore
  }
}

function WishlistBootstrap() {
  const dispatch = useDispatch()

  useEffect(() => {
    const sync = () => {
      const user = auth.getUser()
      const ownerId = user?.id || user?._id || null

      if (!ownerId || user?.isAdmin === true) {
        dispatch(hydrateWishlist(DEFAULT_WISHLIST_STATE))
        // Clear any stale pending item if user is admin.
        if (user?.isAdmin === true) clearPending()
        return
      }

      const snapshot = loadWishlistForUser(ownerId, DEFAULT_WISHLIST_STATE)
      dispatch(hydrateWishlist({ ownerId, items: snapshot.items || [] }))

      const pending = readPending()
      if (pending) {
        dispatch(addToWishlist(pending))
        clearPending()
      }
    }

    sync()
    window.addEventListener('authchange', sync)
    return () => window.removeEventListener('authchange', sync)
  }, [dispatch])

  return null
}

export default WishlistBootstrap

