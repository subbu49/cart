import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  Container, Typography, Box, Card, CardContent, Grid, Button,
  FormControl, InputLabel, Select, MenuItem, Divider, Alert, CircularProgress,
} from '@mui/material'
import { addressAPI, orderAPI, cartAPI } from '../../api/endpoints'
import { fetchCart } from '../../features/cart/cartSlice'
import { toast } from 'react-toastify'

export default function Checkout() {
  const navigate   = useNavigate()
  const dispatch   = useDispatch()
  const [cart, setCart]           = useState(null)
  const [addresses, setAddresses] = useState([])
  const [addressId, setAddressId] = useState('')
  const [payMethod, setPayMethod] = useState('cod')
  const [loading, setLoading]     = useState(true)
  const [placing, setPlacing]     = useState(false)

  useEffect(() => {
    Promise.all([
      cartAPI.get(),
      addressAPI.list(),
    ]).then(([cartRes, addrRes]) => {
      setCart(cartRes.data)
      const addrs = addrRes.data.results ?? addrRes.data
      setAddresses(addrs)
      const def = addrs.find((a) => a.is_default)
      if (def) setAddressId(def.id)
      setLoading(false)
    })
  }, [])

  const handleOrder = async () => {
    if (!addressId) return toast.error('Please select a delivery address')
    setPlacing(true)
    try {
      await orderAPI.create({ address: addressId, payment_method: payMethod })
      dispatch(fetchCart())  // refresh cart count in navbar
      toast.success('Order placed successfully!')
      navigate('/orders')
    } catch (e) {
      const err = e.response?.data
      if (err?.errors) err.errors.forEach((msg) => toast.error(msg))
      else toast.error(err?.error || 'Failed to place order')
    } finally { setPlacing(false) }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>

  if (!cart?.items?.length) return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>Your cart is empty.</Typography>
      <Button variant="contained" onClick={() => navigate('/products')} sx={{ mt: 2 }}>Browse Products</Button>
    </Container>
  )

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontFamily: 'Playfair Display', mb: 4 }}>Checkout</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontFamily: 'Playfair Display', mb: 2 }}>Delivery Address</Typography>
              {addresses.length === 0 ? (
                <Alert severity="warning">No addresses saved. <Button size="small" onClick={() => navigate('/profile')}>Add Address</Button></Alert>
              ) : (
                <FormControl fullWidth>
                  <InputLabel>Select Address</InputLabel>
                  <Select value={addressId} label="Select Address" onChange={(e) => setAddressId(e.target.value)}>
                    {addresses.map((a) => (
                      <MenuItem key={a.id} value={a.id}>
                        {a.full_name} — {a.address}, {a.city}, {a.state} {a.zip_code}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontFamily: 'Playfair Display', mb: 2 }}>Payment Method</Typography>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select value={payMethod} label="Payment Method" onChange={(e) => setPayMethod(e.target.value)}>
                  <MenuItem value="cod">Cash on Delivery</MenuItem>
                  <MenuItem value="upi">UPI</MenuItem>
                  <MenuItem value="card">Credit / Debit Card</MenuItem>
                  <MenuItem value="wallet">Wallet</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontFamily: 'Playfair Display', mb: 2 }}>Order Summary</Typography>
              {cart.items.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{item.product?.name} × {item.quantity}</Typography>
                  <Typography variant="body2">₹{Number(item.subtotal).toFixed(2)}</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography fontWeight={700}>Total</Typography>
                <Typography fontWeight={700} color="primary">₹{Number(cart.total).toFixed(2)}</Typography>
              </Box>
              <Button variant="contained" color="primary" size="large" fullWidth onClick={handleOrder} disabled={placing || !addressId}>
                {placing ? 'Placing Order…' : 'Place Order'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}
