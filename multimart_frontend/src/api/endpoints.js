import api from './axios'

// ── Auth ─────────────────────────────────────────────────────
export const authAPI = {
  register:       (data) => api.post('/auth/register/', data),
  login:          (data) => api.post('/auth/login/', data),
  logout:         (data) => api.post('/auth/logout/', data),
  refreshToken:   (data) => api.post('/auth/token/refresh/', data),
  getProfile:     ()     => api.get('/auth/profile/'),
  updateProfile:  (data) => api.patch('/auth/profile/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
}

// ── Categories ───────────────────────────────────────────────
export const categoryAPI = {
  list:   ()     => api.get('/categories/'),
  create: (data) => api.post('/categories/', data),
  update: (id, data) => api.patch(`/categories/${id}/`, data),
  delete: (id)   => api.delete(`/categories/${id}/`),
}

// ── Shops ────────────────────────────────────────────────────
export const shopAPI = {
  list:    (params) => api.get('/shops/', { params }),
  detail:  (id)     => api.get(`/shops/${id}/`),
  create:  (data)   => api.post('/shops/', data),
  update:  (id, data) => api.patch(`/shops/${id}/`, data),
  approve: (id)     => api.post(`/shops/${id}/approve/`),
  suspend: (id)     => api.post(`/shops/${id}/suspend/`),
}

// ── Products ─────────────────────────────────────────────────
export const productAPI = {
  list:       (params)     => api.get('/products/', { params }),
  detail:     (id)         => api.get(`/products/${id}/`),
  create:     (data)       => api.post('/products/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  createJSON: (data)       => api.post('/products/', data),
  update:     (id, data)   => api.patch(`/products/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateJSON: (id, data)   => api.patch(`/products/${id}/`, data),
  delete:     (id)         => api.delete(`/products/${id}/`),
}

// ── Cart ─────────────────────────────────────────────────────
export const cartAPI = {
  get:        ()           => api.get('/cart/'),
  addItem:    (data)       => api.post('/cart/add_item/', data),
  updateItem: (id, data)   => api.patch(`/cart/update_item/${id}/`, data),
  removeItem: (id)         => api.delete(`/cart/remove_item/${id}/`),
  clear:      ()           => api.post('/cart/clear/'),
}

// ── Addresses ────────────────────────────────────────────────
export const addressAPI = {
  list:   ()           => api.get('/addresses/'),
  create: (data)       => api.post('/addresses/', data),
  update: (id, data)   => api.patch(`/addresses/${id}/`, data),
  delete: (id)         => api.delete(`/addresses/${id}/`),
}

// ── Orders ───────────────────────────────────────────────────
export const orderAPI = {
  list:         ()        => api.get('/orders/'),
  detail:       (id)      => api.get(`/orders/${id}/`),
  create:       (data)    => api.post('/orders/', data),
  items:        (id)      => api.get(`/orders/${id}/items/`),
  updateStatus: (id, data)=> api.post(`/orders/${id}/update_status/`, data),
  cancel:       (id)      => api.post(`/orders/${id}/cancel/`),
}

// ── Reviews ──────────────────────────────────────────────────
export const reviewAPI = {
  list:   (params) => api.get('/reviews/', { params }),
  create: (data)   => api.post('/reviews/', data),
  flag:   (id)     => api.post(`/reviews/${id}/flag/`),
  unflag: (id)     => api.post(`/reviews/${id}/unflag/`),
}

// ── Wishlist ─────────────────────────────────────────────────
export const wishlistAPI = {
  list:   ()     => api.get('/wishlist/'),
  add:    (data) => api.post('/wishlist/', data),
  remove: (id)   => api.delete(`/wishlist/${id}/`),
}

// ── Seller Dashboard ─────────────────────────────────────────
export const sellerAPI = {
  dashboard: ()     => api.get('/seller/dashboard/'),
  orders:    ()     => api.get('/seller/dashboard/orders/'),
}

// ── Admin Dashboard ──────────────────────────────────────────
export const adminAPI = {
  dashboard: ()       => api.get('/admin-dashboard/'),
  users:     (params) => api.get('/admin-dashboard/users/', { params }),
  orders:    ()       => api.get('/admin-dashboard/orders/'),
}
