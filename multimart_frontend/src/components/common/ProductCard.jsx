import { Card, CardMedia, CardContent, CardActions, Typography, Button, Chip, Box } from '@mui/material'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../../features/cart/cartSlice'
import { selectUser } from '../../features/auth/authSlice'

export default function ProductCard({ product }) {
  const dispatch = useDispatch()
  const user     = useSelector(selectUser)

  const handleAddToCart = (e) => {
    e.preventDefault()
    dispatch(addToCart({ product_id: product.id, quantity: 1 }))
  }

  return (
    <Card component={Link} to={`/products/${product.id}`} sx={{ height: '100%', display: 'flex', flexDirection: 'column', textDecoration: 'none', '&:hover': { boxShadow: 4, transform: 'translateY(-2px)', transition: 'all 0.2s' } }}>
      <CardMedia
        component="img"
        height="200"
        image={product.image ? `/media/${product.image}` : 'https://placehold.co/400x300/1a2744/c9a84c?text=No+Image'}
        alt={product.name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: '0.75rem' }}>
          {product.shop_name}
        </Typography>
        <Typography variant="h6" sx={{ fontFamily: 'Playfair Display', fontSize: '1rem', mb: 1 }}>
          {product.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
            ₹{Number(product.final_price).toFixed(2)}
          </Typography>
          {product.discount > 0 && (
            <>
              <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                ₹{Number(product.price).toFixed(2)}
              </Typography>
              <Chip label={`${product.discount}% off`} color="secondary" size="small" sx={{ fontSize: '0.7rem' }} />
            </>
          )}
        </Box>
      </CardContent>
      {user?.role === 'customer' && (
        <CardActions>
          <Button size="small" variant="contained" color="primary" fullWidth onClick={handleAddToCart}
            disabled={product.stock === 0}>
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </CardActions>
      )}
    </Card>
  )
}
