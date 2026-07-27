import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { categoryAPI, productAPI } from '../../api/endpoints'

export const fetchCategories = createAsyncThunk('catalog/categories', async () => { const r = await categoryAPI.list(); return r.data })
export const fetchProducts   = createAsyncThunk('catalog/products',   async (params) => { const r = await productAPI.list(params); return r.data })
export const fetchProduct    = createAsyncThunk('catalog/product',    async (id) => { const r = await productAPI.detail(id); return r.data })

const catalogSlice = createSlice({
  name: 'catalog',
  initialState: { categories: [], products: [], currentProduct: null, loading: false, count: 0, next: null, previous: null },
  reducers: { clearProduct: (state) => { state.currentProduct = null } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => { state.categories = action.payload.results ?? action.payload })
      .addCase(fetchProducts.pending,     (state) => { state.loading = true })
      .addCase(fetchProducts.fulfilled,   (state, action) => { state.loading = false; state.products = action.payload.results ?? []; state.count = action.payload.count ?? 0; state.next = action.payload.next; state.previous = action.payload.previous })
      .addCase(fetchProduct.fulfilled,    (state, action) => { state.currentProduct = action.payload })
  },
})

export const { clearProduct } = catalogSlice.actions
export const selectCategories    = (state) => state.catalog.categories
export const selectProducts      = (state) => state.catalog.products
export const selectCurrentProduct= (state) => state.catalog.currentProduct
export const selectCatalogLoading= (state) => state.catalog.loading
export default catalogSlice.reducer
