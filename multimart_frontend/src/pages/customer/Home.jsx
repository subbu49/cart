import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Box, Container, Typography, Button, Grid, Chip, CircularProgress } from '@mui/material'
import { fetchCategories, fetchProducts, selectCategories, selectProducts, selectCatalogLoading } from '../../features/catalog/catalogSlice'
import ProductCard from '../../components/common/ProductCard'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

export default function Home() {
  const dispatch    = useDispatch()
  const categories  = useSelector(selectCategories)
  const products    = useSelector(selectProducts)
  const loading     = useSelector(selectCatalogLoading)

  useEffect(() => {
    dispatch(fetchCategories())
    dispatch(fetchProducts({ ordering: '-created_at' }))
  }, [dispatch])

  return (
    <Box>
      {/* Hero */}
      <Box sx={{ bgcolor: 'primary.main', color: '#fff', py: { xs: 8, md: 14 }, px: 4 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h2" sx={{ fontFamily: 'Playfair Display', mb: 2, color: 'secondary.main' }}>
            Shop From Many Sellers
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, color: '#b0bfd8', fontWeight: 400 }}>
            MultiMart connects you with independent sellers across hundreds of categories.
          </Typography>
          <Button component={Link} to="/products" variant="contained" color="secondary" size="large" endIcon={<ArrowForwardIcon />}>
            Browse All Products
          </Button>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Categories */}
        {categories.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" sx={{ fontFamily: 'Playfair Display', mb: 3 }}>Shop by Category</Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <Chip
                  key={cat.id}
                  label={cat.name}
                  component={Link}
                  to={`/products?category=${cat.id}`}
                  clickable
                  sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 600, '&:hover': { bgcolor: 'secondary.main', color: 'primary.main' } }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* New Arrivals */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontFamily: 'Playfair Display' }}>New Arrivals</Typography>
          <Button component={Link} to="/products" endIcon={<ArrowForwardIcon />} color="primary">View All</Button>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
        ) : (
          <Grid container spacing={3}>
            {products.slice(0, 8).map((p) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
                <ProductCard product={p} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  )
}
