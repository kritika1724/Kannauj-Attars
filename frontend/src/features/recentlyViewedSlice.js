import { createSlice } from '@reduxjs/toolkit'
import { saveRecentFor } from '../utils/recentlyViewedStorage'

export const DEFAULT_RECENT_STATE = {
  ownerId: 'guest',
  items: [],
}

const saveRecent = (state) => {
  saveRecentFor(state.ownerId || 'guest', { items: state.items })
}

const initial = DEFAULT_RECENT_STATE

const recentlyViewedSlice = createSlice({
  name: 'recentlyViewed',
  initialState: initial,
  reducers: {
    hydrateRecent(state, action) {
      const { ownerId, items } = action.payload || {}
      state.ownerId = ownerId || 'guest'
      state.items = Array.isArray(items) ? items : []
    },
    viewProduct(state, action) {
      const item = action.payload
      if (!item?.product) return

      state.items = state.items.filter((x) => x.product !== item.product)
      state.items.unshift({ ...item, viewedAt: Date.now() })
      if (state.items.length > 12) state.items = state.items.slice(0, 12)
      saveRecent(state)
    },
    clearRecent(state) {
      state.items = []
      saveRecent(state)
    },
  },
})

export const { hydrateRecent, viewProduct, clearRecent } = recentlyViewedSlice.actions

export default recentlyViewedSlice.reducer

