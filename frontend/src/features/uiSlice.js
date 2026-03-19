import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  selectedCollection: 'signature',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSelectedCollection(state, action) {
      state.selectedCollection = action.payload
    },
  },
})

export const { setSelectedCollection } = uiSlice.actions
export default uiSlice.reducer
