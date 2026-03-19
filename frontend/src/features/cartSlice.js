import { createSlice } from '@reduxjs/toolkit'
import { saveCartForUser } from '../utils/cartStorage'

export const DEFAULT_SHIPPING = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
}

export const DEFAULT_CART_STATE = {
  ownerId: null,
  items: [],
  shippingAddress: DEFAULT_SHIPPING,
  paymentMethod: 'COD',
}

const saveCart = (state) => {
  if (!state.ownerId) return
  saveCartForUser(state.ownerId, {
    items: state.items,
    shippingAddress: state.shippingAddress,
    paymentMethod: state.paymentMethod,
  })
}

const initial = DEFAULT_CART_STATE

const cartSlice = createSlice({
  name: 'cart',
  initialState: initial,
  reducers: {
    hydrateCart(state, action) {
      const { ownerId, items, shippingAddress, paymentMethod } = action.payload || {}
      state.ownerId = ownerId || null
      state.items = Array.isArray(items) ? items : []
      state.shippingAddress = { ...DEFAULT_SHIPPING, ...(shippingAddress || {}) }
      state.paymentMethod = paymentMethod || 'COD'
      // Don’t save on hydrate; it’s a read path.
    },
    addToCart(state, action) {
      const item = action.payload
      const existing = state.items.find(
        (x) => x.product === item.product && (x.packLabel || '') === (item.packLabel || '')
      )
      if (existing) {
        existing.qty = Math.min(existing.qty + item.qty, 99)
      } else {
        state.items.push(item)
      }
      saveCart(state)
    },
    updateQty(state, action) {
      const { product, qty, packLabel = '' } = action.payload
      const existing = state.items.find((x) => x.product === product && (x.packLabel || '') === packLabel)
      if (existing) {
        existing.qty = Math.max(1, Math.min(Number(qty || 1), 99))
      }
      saveCart(state)
    },
    removeFromCart(state, action) {
      const { product, packLabel = '' } = action.payload || {}
      // Backward-compatible: if a string id is passed, remove all packs for that product.
      if (typeof action.payload === 'string') {
        state.items = state.items.filter((x) => x.product !== action.payload)
      } else {
        state.items = state.items.filter(
          (x) => !(x.product === product && (x.packLabel || '') === packLabel)
        )
      }
      saveCart(state)
    },
    clearCart(state) {
      state.items = []
      saveCart(state)
    },
    saveShippingAddress(state, action) {
      state.shippingAddress = { ...state.shippingAddress, ...action.payload }
      saveCart(state)
    },
    savePaymentMethod(state, action) {
      state.paymentMethod = action.payload || 'COD'
      saveCart(state)
    },
  },
})

export const {
  addToCart,
  updateQty,
  removeFromCart,
  clearCart,
  saveShippingAddress,
  savePaymentMethod,
  hydrateCart,
} = cartSlice.actions

export default cartSlice.reducer
