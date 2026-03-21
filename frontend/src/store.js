import { configureStore } from '@reduxjs/toolkit'
import uiReducer from './features/uiSlice'
import cartReducer from './features/cartSlice'
import recentlyViewedReducer from './features/recentlyViewedSlice'

const store = configureStore({
  reducer: {
    ui: uiReducer,
    cart: cartReducer,
    recentlyViewed: recentlyViewedReducer,
  },
})

export default store
