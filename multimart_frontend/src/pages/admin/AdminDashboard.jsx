import { useEffect, useState } from 'react'
import { Grid, Typography, Box, CircularProgress } from '@mui/material'
import PeopleIcon    from '@mui/icons-material/People'
import StoreIcon     from '@mui/icons-material/Store'
import InventoryIcon from '@mui/icons-material/Inventory2'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import { adminAPI } from '../../api/endpoints'
import StatCard from '../../components/common/StatCard'

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.dashboard().then((r) => { setStats(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
  if (!stats)  return <Typography>Failed to load dashboard.</Typography>

  return (
    <Box>
      <Typography variant="h4" sx={{ fontFamily: 'Playfair Display', mb: 4 }}>Platform Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={6} md={3}><StatCard title="Total Revenue"   value={`₹${Number(stats.total_revenue).toFixed(0)}`}   icon={<TrendingUpIcon fontSize="inherit" />}  color="#c9a84c" /></Grid>
        <Grid item xs={6} md={3}><StatCard title="Monthly Revenue" value={`₹${Number(stats.monthly_revenue).toFixed(0)}`} icon={<TrendingUpIcon fontSize="inherit" />}  color="primary.main" /></Grid>
        <Grid item xs={6} md={3}><StatCard title="Total Orders"    value={stats.total_orders}    icon={<ShoppingBagIcon fontSize="inherit" />} color="primary.main" /></Grid>
        <Grid item xs={6} md={3}><StatCard title="Total Products"  value={stats.total_products}  icon={<InventoryIcon fontSize="inherit" />}   color="primary.main" /></Grid>
        <Grid item xs={6} md={3}><StatCard title="Total Users"     value={stats.total_users}     icon={<PeopleIcon fontSize="inherit" />}      color="primary.main" /></Grid>
        <Grid item xs={6} md={3}><StatCard title="Total Sellers"   value={stats.total_sellers}   icon={<PeopleIcon fontSize="inherit" />}      color="#c9a84c" /></Grid>
        <Grid item xs={6} md={3}><StatCard title="Total Shops"     value={stats.total_shops}     icon={<StoreIcon fontSize="inherit" />}       color="primary.main" /></Grid>
        <Grid item xs={6} md={3}><StatCard title="Pending Shops"   value={stats.pending_shops}   icon={<StoreIcon fontSize="inherit" />}       color="#e65100" /></Grid>
      </Grid>
    </Box>
  )
}
