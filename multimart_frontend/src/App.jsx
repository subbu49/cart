import { ThemeProvider, CssBaseline } from '@mui/material'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import theme from './theme'
import { selectUser } from './features/auth/authSlice'

// Customer pages
import Home          from './pages/customer/Home'
import Products      from './pages/customer/Products'
import ProductDetail from './pages/customer/ProductDetail'
import Cart          from './pages/customer/Cart'
import Checkout      from './pages/customer/Checkout'
import Orders        from './pages/customer/Orders'
import Wishlist      from './pages/customer/Wishlist'
import Profile       from './pages/customer/Profile'

// Seller pages
import SellerDashboard from './pages/seller/SellerDashboard'
import SellerShop      from './pages/seller/SellerShop'
import SellerProducts  from './pages/seller/SellerProducts'
import SellerOrders    from './pages/seller/SellerOrders'

// Admin pages
import AdminDashboard  from './pages/admin/AdminDashboard'
import AdminUsers      from './pages/admin/AdminUsers'
import AdminShops      from './pages/admin/AdminShops'
import AdminProducts   from './pages/admin/AdminProducts'
import AdminOrders     from './pages/admin/AdminOrders'
import AdminCategories from './pages/admin/AdminCategories'

// Auth pages
import Login    from './pages/Login'
import Register from './pages/Register'

// Layouts
import CustomerLayout from './components/layouts/CustomerLayout'
import SellerLayout   from './components/layouts/SellerLayout'
import AdminLayout    from './components/layouts/AdminLayout'

/** Route guard — redirects to /login if not authenticated, or to / if wrong role */
function RequireAuth({ role }) {
  const user = useSelector(selectUser)
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return null  // let the parent Route render its element
}

/** Wrapper that guards a layout — returns the layout if auth passes */
function ProtectedLayout({ role, Layout }) {
  const user = useSelector(selectUser)
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return <Layout />
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* ── Auth pages ── */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Customer storefront ── */}
        <Route element={<CustomerLayout />}>
          <Route path="/"             element={<Home />} />
          <Route path="/products"     element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />

          {/* Auth-required customer routes */}
          <Route path="/cart"     element={<>{<RequireCustomer />}<Cart /></>} />
          <Route path="/checkout" element={<>{<RequireCustomer />}<Checkout /></>} />
          <Route path="/orders"   element={<>{<RequireCustomer />}<Orders /></>} />
          <Route path="/wishlist" element={<>{<RequireCustomer />}<Wishlist /></>} />
          <Route path="/profile"  element={<>{<RequireCustomer />}<Profile /></>} />
        </Route>

        {/* ── Seller panel ── */}
        <Route element={<ProtectedLayout role="seller" Layout={SellerLayout} />}>
          <Route path="/seller"          element={<SellerDashboard />} />
          <Route path="/seller/shop"     element={<SellerShop />} />
          <Route path="/seller/products" element={<SellerProducts />} />
          <Route path="/seller/orders"   element={<SellerOrders />} />
        </Route>

        {/* ── Admin panel ── */}
        <Route element={<ProtectedLayout role="admin" Layout={AdminLayout} />}>
          <Route path="/admin"            element={<AdminDashboard />} />
          <Route path="/admin/users"      element={<AdminUsers />} />
          <Route path="/admin/shops"      element={<AdminShops />} />
          <Route path="/admin/products"   element={<AdminProducts />} />
          <Route path="/admin/orders"     element={<AdminOrders />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  )
}

/** Guards any route that requires a logged-in user (any role) */
function RequireCustomer() {
  const user = useSelector(selectUser)
  if (!user) return <Navigate to="/login" replace />
  return null
}
