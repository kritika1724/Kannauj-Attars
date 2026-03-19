import { configureStore } from '@reduxjs/toolkit'
import uiReducer from './features/uiSlice'
import cartReducer from './features/cartSlice'
import wishlistReducer from './features/wishlistSlice'
import recentlyViewedReducer from './features/recentlyViewedSlice'

const store = configureStore({
  reducer: {
    ui: uiReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    recentlyViewed: recentlyViewedReducer,
  },
})

export default store
