import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { hydrateRecent, DEFAULT_RECENT_STATE } from '../features/recentlyViewedSlice'
import { loadRecentFor, saveRecentFor } from '../utils/recentlyViewedStorage'
import { auth } from '../services/api'

function RecentlyViewedBootstrap() {
  const dispatch = useDispatch()

  useEffect(() => {
    const sync = () => {
      const user = auth.getUser()
      const ownerId = user?.id || user?._id || 'guest'

      const snapshot = loadRecentFor(ownerId, DEFAULT_RECENT_STATE)
      let items = Array.isArray(snapshot.items) ? snapshot.items : []

      // Nice UX: if user logs in and has no recent history yet, carry over guest recent list.
      if (ownerId !== 'guest' && items.length === 0) {
        const guest = loadRecentFor('guest', DEFAULT_RECENT_STATE)
        const guestItems = Array.isArray(guest.items) ? guest.items : []
        if (guestItems.length) {
          items = guestItems
          saveRecentFor(ownerId, { items: guestItems })
        }
      }

      dispatch(hydrateRecent({ ownerId, items }))
    }

    sync()
    window.addEventListener('authchange', sync)
    return () => window.removeEventListener('authchange', sync)
  }, [dispatch])

  return null
}

export default RecentlyViewedBootstrap

