import { useEffect, useState } from 'react'
import { Grid, Typography, Box, CircularProgress } from '@mui/material'
import TrendingUpIcon   from '@mui/icons-material/TrendingUp'
import InventoryIcon    from '@mui/icons-material/Inventory2'
import ShoppingBagIcon  from '@mui/icons-material/ShoppingBag'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { sellerAPI } from '../../api/endpoints'
import StatCard from '../../components/common/StatCard'

export default function SellerDashboard() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sellerAPI.dashboard().then((r) => { setStats(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
  if (!stats)  return <Typography>No data available. Make sure your shop is approved.</Typography>

  return (
    <Box>
      <Typography variant="h4" sx={{ fontFamily: 'Playfair Display', mb: 4 }}>Seller Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Revenue"    value={`₹${Number(stats.total_revenue).toFixed(0)}`}   icon={<TrendingUpIcon fontSize="inherit" />}    color="#c9a84c" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Monthly Revenue"  value={`₹${Number(stats.monthly_revenue).toFixed(0)}`} icon={<TrendingUpIcon fontSize="inherit" />}    color="primary.main" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Orders"     value={stats.total_orders}    icon={<ShoppingBagIcon fontSize="inherit" />}  color="primary.main" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Pending Orders"   value={stats.pending_orders}  icon={<ShoppingBagIcon fontSize="inherit" />}  color="#e65100" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Active Products"  value={stats.active_products} icon={<InventoryIcon fontSize="inherit" />}    color="success.main" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Products"   value={stats.total_products}  icon={<InventoryIcon fontSize="inherit" />}    color="primary.main" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Low Stock Alerts" value={stats.low_stock_products} icon={<WarningAmberIcon fontSize="inherit" />} color="error.main" /></Grid>
      </Grid>
    </Box>
  )
}
