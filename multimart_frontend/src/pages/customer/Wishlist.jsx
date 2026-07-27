import { useEffect, useState } from 'react'
import { Container, Typography, Grid, Button, Box, CircularProgress } from '@mui/material'
import { wishlistAPI } from '../../api/endpoints'
import ProductCard from '../../components/common/ProductCard'
import { toast } from 'react-toastify'

export default function Wishlist() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => { wishlistAPI.list().then((r) => { setItems(r.data.results ?? r.data); setLoading(false) }) }
  useEffect(() => { load() }, [])

  const handleRemove = async (id) => {
    await wishlistAPI.remove(id)
    toast.info('Removed from wishlist')
    load()
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontFamily: 'Playfair Display', mb: 4 }}>Wishlist ({items.length})</Typography>
      {items.length === 0 ? <Typography>Your wishlist is empty.</Typography> : (
        <Grid container spacing={3}>
          {items.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <Box sx={{ position: 'relative' }}>
                <ProductCard product={item.product} />
                <Button size="small" color="error" sx={{ mt: 1 }} onClick={() => handleRemove(item.id)}>Remove</Button>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}
