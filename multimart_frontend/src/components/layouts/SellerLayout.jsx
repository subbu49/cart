import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, IconButton, Tooltip, Divider,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import StoreIcon     from '@mui/icons-material/Store'
import InventoryIcon from '@mui/icons-material/Inventory2'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import LogoutIcon    from '@mui/icons-material/Logout'
import { logout, selectUser } from '../../features/auth/authSlice'

const W = 220
const NAV = [
  { label: 'Dashboard', to: '/seller',          icon: <DashboardIcon /> },
  { label: 'My Shop',   to: '/seller/shop',     icon: <StoreIcon /> },
  { label: 'Products',  to: '/seller/products', icon: <InventoryIcon /> },
  { label: 'Orders',    to: '/seller/orders',   icon: <ShoppingBagIcon /> },
]

export default function SellerLayout() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const user      = useSelector(selectUser)

  const handleLogout = async () => { await dispatch(logout()); navigate('/login') }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1, bgcolor: 'primary.main' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ fontFamily: 'Playfair Display', fontWeight: 700, flex: 1, color: 'secondary.main' }}>
            MultiMart — Seller
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, color: '#fff' }}>{user?.first_name}</Typography>
          <Tooltip title="Logout">
            <IconButton color="inherit" onClick={handleLogout}><LogoutIcon /></IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" sx={{ width: W, flexShrink: 0, '& .MuiDrawer-paper': { width: W, boxSizing: 'border-box', bgcolor: '#0f1b35', color: '#cdd5e0' } }}>
        <Toolbar />
        <List>
          {NAV.map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              end={item.to === '/seller'}
              sx={{ '&.active': { bgcolor: 'secondary.main', color: 'primary.main', borderRadius: 1, mx: 1 }, borderRadius: 1, mx: 1, mb: 0.5, color: '#cdd5e0' }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
        <Divider sx={{ borderColor: '#ffffff20', mt: 'auto', mb: 2 }} />
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, ml: `${W}px` }}>
        <Outlet />
      </Box>
    </Box>
  )
}
