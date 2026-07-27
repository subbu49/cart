import { useEffect, useState } from 'react'
import { Container, Typography, Box, Card, CardContent, Chip, Divider, Button, CircularProgress } from '@mui/material'
import { orderAPI } from '../../api/endpoints'
import { toast } from 'react-toastify'

const STATUS_COLORS = { pending: 'warning', confirmed: 'info', processing: 'info', shipped: 'primary', delivered: 'success', cancelled: 'error' }

export default function Orders() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => { setLoading(true); orderAPI.list().then((r) => { setOrders(r.data.results ?? r.data); setLoading(false) }) }
  useEffect(() => { load() }, [])

  const handleCancel = async (id) => {
    try { await orderAPI.cancel(id); toast.success('Order cancelled'); load() }
    catch (e) { toast.error(e.response?.data?.error || 'Cannot cancel order') }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontFamily: 'Playfair Display', mb: 4 }}>My Orders</Typography>
      {orders.length === 0 ? <Typography>No orders yet.</Typography> : orders.map((order) => (
        <Card key={order.id} sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontFamily: 'Playfair Display' }}>Order #{order.id}</Typography>
                <Typography variant="body2" color="text.secondary">{new Date(order.created_at).toLocaleDateString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip label={order.order_status.toUpperCase()} color={STATUS_COLORS[order.order_status] || 'default'} size="small" />
                <Typography fontWeight={700} color="primary">₹{Number(order.total_amount).toFixed(2)}</Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {order.items?.map((item) => (
              <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">{item.product_name} × {item.quantity} <Typography component="span" variant="body2" color="text.secondary">({item.shop_name})</Typography></Typography>
                <Typography variant="body2">₹{Number(item.subtotal).toFixed(2)}</Typography>
              </Box>
            ))}
            {['pending', 'confirmed'].includes(order.order_status) && (
              <Button size="small" color="error" sx={{ mt: 2 }} onClick={() => handleCancel(order.id)}>Cancel Order</Button>
            )}
          </CardContent>
        </Card>
      ))}
    </Container>
  )
}
