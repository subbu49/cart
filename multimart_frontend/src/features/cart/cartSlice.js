import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cartAPI } from '../../api/endpoints'
import { toast } from 'react-toastify'

export const fetchCart     = createAsyncThunk('cart/fetch',  async () => { const r = await cartAPI.get(); return r.data })
export const addToCart     = createAsyncThunk('cart/add',    async (data, { rejectWithValue }) => { try { await cartAPI.addItem(data); const r = await cartAPI.get(); return r.data } catch(e) { return rejectWithValue(e.response?.data) } })
export const removeFromCart= createAsyncThunk('cart/remove', async (id) => { await cartAPI.removeItem(id); const r = await cartAPI.get(); return r.data })
export const updateCartItem= createAsyncThunk('cart/update', async ({ id, quantity }) => { await cartAPI.updateItem(id, { quantity }); const r = await cartAPI.get(); return r.data })
export const clearCart     = createAsyncThunk('cart/clear',  async () => { await cartAPI.clear(); return { items: [], total: 0, item_count: 0 } })

const cartSlice = createSlice({
  name: 'cart',
  initialState: { data: null, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    const setCart = (state, action) => { state.loading = false; state.data = action.payload }
    builder
      .addCase(fetchCart.pending,      (s) => { s.loading = true })
      .addCase(fetchCart.fulfilled,    setCart)
      .addCase(addToCart.fulfilled,    (state, action) => { setCart(state, action); toast.success('Added to cart') })
      .addCase(addToCart.rejected,     (_, action) => {
        const err = action.payload
        const msg = err?.non_field_errors?.[0] || err?.product_id?.[0] || err?.detail || 'Could not add to cart'
        toast.error(msg)
      })
      .addCase(removeFromCart.fulfilled, setCart)
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(clearCart.fulfilled,    setCart)
  },
})

export const selectCart      = (state) => state.cart.data
export const selectCartCount = (state) => state.cart.data?.item_count ?? 0
export default cartSlice.reducer
