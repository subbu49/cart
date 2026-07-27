import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import {
  Container, Typography, Box, Card, CardContent, Grid, IconButton,
  Button, Divider, CircularProgress,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon    from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { fetchCart, removeFromCart, updateCartItem, selectCart } from '../../features/cart/cartSlice'

export default function Cart() {
  const dispatch = useDispatch()
  const cart     = useSelector(selectCart)
  const navigate = useNavigate()

  useEffect(() => { dispatch(fetchCart()) }, [dispatch])

  if (!cart) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>

  const items = cart.items ?? []

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontFamily: 'Playfair Display', mb: 4 }}>Shopping Cart</Typography>
      {items.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Your cart is empty</Typography>
          <Button component={Link} to="/products" variant="contained">Browse Products</Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {items.map((item) => (
              <Card key={item.id} sx={{ mb: 2 }}>
                <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box component="img"
                    src={item.product?.image ? `/media/${item.product.image}` : 'https://placehold.co/80x80/1a2744/c9a84c?text=?'}
                    sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>{item.product?.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.product?.shop_name}</Typography>
                    <Typography variant="body1" color="primary" fontWeight={700} sx={{ mt: 0.5 }}>
                      ₹{Number(item.price).toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton size="small" onClick={() => item.quantity > 1 && dispatch(updateCartItem({ id: item.id, quantity: item.quantity - 1 }))}>
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography sx={{ minWidth: 32, textAlign: 'center' }}>{item.quantity}</Typography>
                    <IconButton size="small" onClick={() => dispatch(updateCartItem({ id: item.id, quantity: item.quantity + 1 }))}>
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography fontWeight={700} sx={{ minWidth: 80, textAlign: 'right' }}>
                    ₹{Number(item.subtotal).toFixed(2)}
                  </Typography>
                  <IconButton color="error" onClick={() => dispatch(removeFromCart(item.id))}>
                    <DeleteIcon />
                  </IconButton>
                </CardContent>
              </Card>
            ))}
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontFamily: 'Playfair Display', mb: 2 }}>Order Summary</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Items ({cart.item_count})</Typography>
                  <Typography>₹{Number(cart.total).toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography fontWeight={700}>Total</Typography>
                  <Typography fontWeight={700} color="primary" variant="h6">₹{Number(cart.total).toFixed(2)}</Typography>
                </Box>
                <Button variant="contained" color="primary" fullWidth size="large" onClick={() => navigate('/checkout')}>
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  )
}
