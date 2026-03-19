import { createSlice } from '@reduxjs/toolkit'
import { saveWishlistForUser } from '../utils/wishlistStorage'

export const DEFAULT_WISHLIST_STATE = {
  ownerId: null,
  items: [],
}

const saveWishlist = (state) => {
  if (!state.ownerId) return
  saveWishlistForUser(state.ownerId, { items: state.items })
}

const initial = DEFAULT_WISHLIST_STATE

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: initial,
  reducers: {
    hydrateWishlist(state, action) {
      const { ownerId, items } = action.payload || {}
      state.ownerId = ownerId || null
      state.items = Array.isArray(items) ? items : []
    },
    addToWishlist(state, action) {
      const item = action.payload
      if (!item?.product) return
      const exists = state.items.some((x) => x.product === item.product)
      if (!exists) state.items.unshift(item)
      // Trim to a sane max to keep storage small.
      if (state.items.length > 200) state.items = state.items.slice(0, 200)
      saveWishlist(state)
    },
    removeFromWishlist(state, action) {
      const productId = typeof action.payload === 'string' ? action.payload : action.payload?.product
      if (!productId) return
      state.items = state.items.filter((x) => x.product !== productId)
      saveWishlist(state)
    },
    clearWishlist(state) {
      state.items = []
      saveWishlist(state)
    },
  },
})

export const { hydrateWishlist, addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions

export default wishlistSlice.reducer

