import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  AppBar, Toolbar, Typography, Button, IconButton, Badge,
  Box, Menu, MenuItem, Divider,
} from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { logout, selectUser } from '../../features/auth/authSlice'
import { selectCartCount } from '../../features/cart/cartSlice'

export default function Navbar() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const user      = useSelector(selectUser)
  const cartCount = useSelector(selectCartCount)
  const [anchor, setAnchor] = useState(null)

  const handleLogout = async () => {
    setAnchor(null)
    await dispatch(logout())
    navigate('/login')
  }

  const dashboardPath = user?.role === 'seller' ? '/seller' : user?.role === 'admin' ? '/admin' : '/profile'

  return (
    <AppBar position="fixed" sx={{ bgcolor: 'primary.main', boxShadow: 2 }}>
      <Toolbar>
        {/* Logo */}
        <Typography
          variant="h5" component={Link} to="/"
          sx={{ fontFamily: 'Playfair Display', fontWeight: 700, color: 'secondary.main', flexGrow: 1, textDecoration: 'none' }}
        >
          MultiMart
        </Typography>

        {/* Nav Links */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button color="inherit" component={Link} to="/products" sx={{ color: '#e0e6f0' }}>Products</Button>

          {user?.role === 'customer' && (
            <>
              <IconButton color="inherit" component={Link} to="/cart">
                <Badge badgeContent={cartCount} color="secondary">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
              <IconButton onClick={(e) => setAnchor(e.currentTarget)} color="inherit">
                <AccountCircleIcon />
              </IconButton>
            </>
          )}

          {user && user.role !== 'customer' && (
            <Button variant="contained" color="secondary" component={Link} to={dashboardPath} sx={{ fontWeight: 700 }}>
              {user.role === 'seller' ? 'Seller Panel' : 'Admin Panel'}
            </Button>
          )}

          {!user && (
            <>
              <Button color="inherit" component={Link} to="/login" sx={{ color: '#e0e6f0' }}>Login</Button>
              <Button variant="contained" color="secondary" component={Link} to="/register">Register</Button>
            </>
          )}
        </Box>

        {/* User menu */}
        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
          <MenuItem disabled><Typography variant="body2" color="text.secondary">{user?.email}</Typography></MenuItem>
          <Divider />
          <MenuItem component={Link} to="/profile" onClick={() => setAnchor(null)}>Profile</MenuItem>
          <MenuItem component={Link} to="/orders" onClick={() => setAnchor(null)}>My Orders</MenuItem>
          <MenuItem component={Link} to="/wishlist" onClick={() => setAnchor(null)}>Wishlist</MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
