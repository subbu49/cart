import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Box, Container, Typography, Button, Grid, Card, CardMedia, CardContent, Chip, CircularProgress } from '@mui/material'
import { fetchProduct, selectCurrentProduct, clearProduct } from '../../features/catalog/catalogSlice'
import { addToCart } from '../../features/cart/cartSlice'
import { selectUser } from '../../features/auth/authSlice'

export default function ProductDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const product  = useSelector(selectCurrentProduct)
  const user     = useSelector(selectUser)

  useEffect(() => {
    dispatch(fetchProduct(id))
    return () => dispatch(clearProduct())
  }, [dispatch, id])

  if (!product) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>

  const handleAddToCart = () => dispatch(addToCart({ product_id: product.id, quantity: 1 }))

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              image={product.image ? `/media/${product.image}` : 'https://placehold.co/600x400/1a2744/c9a84c?text=No+Image'}
              alt={product.name}
              sx={{ height: 400, objectFit: 'cover' }}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body2" color="text.secondary">{product.shop?.shop_name}</Typography>
          <Typography variant="h3" sx={{ fontFamily: 'Playfair Display', mt: 1, mb: 2 }}>{product.name}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>₹{Number(product.final_price).toFixed(2)}</Typography>
            {product.discount > 0 && (
              <>
                <Typography variant="h6" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>₹{Number(product.price).toFixed(2)}</Typography>
                <Chip label={`${product.discount}% OFF`} color="secondary" />
              </>
            )}
          </Box>
          <Typography paragraph>{product.description}</Typography>
          <Typography variant="body2" color={product.stock > 0 ? 'success.main' : 'error.main'} sx={{ mb: 3 }}>
            {product.stock > 0 ? `In Stock: ${product.stock} units` : 'Out of Stock'}
          </Typography>
          {user?.role === 'customer' && (
            <Button variant="contained" color="primary" size="large" onClick={handleAddToCart} disabled={product.stock === 0}>
              Add to Cart
            </Button>
          )}
        </Grid>
      </Grid>
    </Container>
  )
}
