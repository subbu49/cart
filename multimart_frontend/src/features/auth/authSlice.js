import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '../../api/endpoints'
import { toast } from 'react-toastify'

const loadUser = () => {
  try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
}

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.register(data)
    localStorage.setItem('access_token',  res.data.tokens.access)
    localStorage.setItem('refresh_token', res.data.tokens.refresh)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    return res.data.user
  } catch (e) {
    return rejectWithValue(e.response?.data || { error: 'Registration failed' })
  }
})

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.login(data)
    localStorage.setItem('access_token',  res.data.access)
    localStorage.setItem('refresh_token', res.data.refresh)
    // fetch profile to get role
    const profile = await authAPI.getProfile()
    localStorage.setItem('user', JSON.stringify(profile.data))
    return profile.data
  } catch (e) {
    return rejectWithValue(e.response?.data || { error: 'Login failed' })
  }
})

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    const refresh = localStorage.getItem('refresh_token')
    await authAPI.logout({ refresh_token: refresh })
  } catch { /* ignore */ }
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
})

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await authAPI.getProfile()
    localStorage.setItem('user', JSON.stringify(res.data))
    return res.data
  } catch (e) { return rejectWithValue(e.response?.data) }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: loadUser(), loading: false, error: null },
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    const pending  = (state) => { state.loading = true; state.error = null }
    const rejected = (state, action) => { state.loading = false; state.error = action.payload }

    builder
      .addCase(register.pending, pending)
      .addCase(register.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; toast.success('Welcome to MultiMart!') })
      .addCase(register.rejected, rejected)

      .addCase(login.pending, pending)
      .addCase(login.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; toast.success(`Welcome back, ${action.payload.first_name}!`) })
      .addCase(login.rejected, rejected)

      .addCase(logout.fulfilled, (state) => { state.user = null; state.loading = false })

      .addCase(fetchProfile.fulfilled, (state, action) => { state.user = action.payload })
  },
})

export const { clearError } = authSlice.actions
export const selectUser = (state) => state.auth.user
export const selectRole = (state) => state.auth.user?.role
export const selectAuthLoading = (state) => state.auth.loading
export const selectAuthError   = (state) => state.auth.error
export default authSlice.reducer
