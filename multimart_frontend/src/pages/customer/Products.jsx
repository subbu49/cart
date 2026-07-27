import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { Box, Container, Typography, Grid, CircularProgress } from '@mui/material'
import { fetchProducts, selectProducts, selectCatalogLoading } from '../../features/catalog/catalogSlice'
import ProductCard from '../../components/common/ProductCard'

export default function Products() {
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const products = useSelector(selectProducts)
  const loading  = useSelector(selectCatalogLoading)

  useEffect(() => {
    const params = Object.fromEntries(searchParams)
    dispatch(fetchProducts(params))
  }, [dispatch, searchParams])

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontFamily: 'Playfair Display', mb: 4 }}>All Products</Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : products.length === 0 ? (
        <Typography>No products found.</Typography>
      ) : (
        <Grid container spacing={3}>
          {products.map((p) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
              <ProductCard product={p} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}
