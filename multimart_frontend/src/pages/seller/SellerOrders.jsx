import { useEffect, useState } from 'react'
import {
  Box, Typography, Card, CardContent, Chip, Divider,
  Select, MenuItem, FormControl, InputLabel, Button, CircularProgress,
} from '@mui/material'
import { sellerAPI, orderAPI } from '../../api/endpoints'
import { toast } from 'react-toastify'

const STATUS_COLOR  = { pending: 'warning', confirmed: 'info', processing: 'info', shipped: 'primary', delivered: 'success', cancelled: 'error' }
const NEXT_STATUSES = { pending: ['confirmed'], confirmed: ['processing'], processing: ['shipped'], shipped: ['delivered'] }

export default function SellerOrders() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => { sellerAPI.orders().then((r) => { setOrders(r.data); setLoading(false) }) }
  useEffect(() => { load() }, [])

  const handleStatus = async (orderId, newStatus) => {
    try { await orderAPI.updateStatus(orderId, { order_status: newStatus }); toast.success('Status updated'); load() }
    catch (e) { toast.error(e.response?.data?.error || 'Failed to update status') }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>

  return (
    <Box>
      <Typography variant="h4" sx={{ fontFamily: 'Playfair Display', mb: 4 }}>Orders</Typography>
      {orders.length === 0 ? <Typography>No orders yet.</Typography> : orders.map((order) => (
        <Card key={order.id} sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontFamily: 'Playfair Display' }}>Order #{order.id}</Typography>
                <Typography variant="body2" color="text.secondary">{new Date(order.created_at).toLocaleDateString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Chip label={order.order_status.toUpperCase()} color={STATUS_COLOR[order.order_status] || 'default'} />
                <Typography fontWeight={700} color="secondary.dark">My Total: ₹{Number(order.my_total).toFixed(2)}</Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {order.items?.map((item) => (
              <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">{item.product_name} × {item.quantity}</Typography>
                <Typography variant="body2">₹{Number(item.subtotal).toFixed(2)}</Typography>
              </Box>
            ))}
            {NEXT_STATUSES[order.order_status]?.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {NEXT_STATUSES[order.order_status].map((s) => (
                  <Button key={s} size="small" variant="outlined" color="primary" sx={{ mr: 1 }} onClick={() => handleStatus(order.id, s)}>
                    Mark as {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}
