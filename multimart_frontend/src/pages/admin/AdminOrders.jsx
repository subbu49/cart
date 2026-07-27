import { useEffect, useState } from 'react'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Button, CircularProgress, Collapse, IconButton,
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon   from '@mui/icons-material/KeyboardArrowUp'
import { adminAPI, orderAPI } from '../../api/endpoints'
import { toast } from 'react-toastify'

const STATUS_COLOR = { pending: 'warning', confirmed: 'info', processing: 'info', shipped: 'primary', delivered: 'success', cancelled: 'error' }

function OrderRow({ order, onRefresh }) {
  const [open, setOpen] = useState(false)

  const handleStatus = async (status) => {
    try { await orderAPI.updateStatus(order.id, { order_status: status }); toast.success('Updated'); onRefresh() }
    catch (e) { toast.error(e.response?.data?.error || 'Failed') }
  }

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>#{order.id}</TableCell>
        <TableCell>{order.customer_name}</TableCell>
        <TableCell>₹{Number(order.total_amount).toFixed(2)}</TableCell>
        <TableCell><Chip label={order.order_status} color={STATUS_COLOR[order.order_status] || 'default'} size="small" /></TableCell>
        <TableCell><Chip label={order.payment_status} variant="outlined" size="small" /></TableCell>
        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
        <TableCell align="right">
          {order.order_status !== 'cancelled' && order.order_status !== 'delivered' && (
            <Button size="small" color="error" onClick={() => handleStatus('cancelled')}>Cancel</Button>
          )}
          {order.order_status === 'pending' && (
            <Button size="small" color="primary" onClick={() => handleStatus('confirmed')}>Confirm</Button>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={8} sx={{ py: 0 }}>
          <Collapse in={open}>
            <Box sx={{ px: 4, py: 2, bgcolor: '#f5f5f5' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Order Items</Typography>
              {order.items?.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{item.product_name} × {item.quantity} ({item.shop_name})</Typography>
                  <Typography variant="body2">₹{Number(item.subtotal).toFixed(2)}</Typography>
                </Box>
              ))}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

export default function AdminOrders() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => { adminAPI.orders().then((r) => { setOrders(r.data.results ?? r.data); setLoading(false) }) }
  useEffect(() => { load() }, [])

  return (
    <Box>
      <Typography variant="h4" sx={{ fontFamily: 'Playfair Display', mb: 3 }}>All Orders ({orders.length})</Typography>
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell /><TableCell>Order</TableCell>
                <TableCell>Customer</TableCell><TableCell>Total</TableCell>
                <TableCell>Status</TableCell><TableCell>Payment</TableCell>
                <TableCell>Date</TableCell><TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((o) => <OrderRow key={o.id} order={o} onRefresh={load} />)}
              {orders.length === 0 && <TableRow><TableCell colSpan={8} align="center">No orders.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
