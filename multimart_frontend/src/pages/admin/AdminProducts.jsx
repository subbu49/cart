import { useEffect, useState } from 'react'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Button, CircularProgress,
} from '@mui/material'
import { productAPI } from '../../api/endpoints'
import { toast } from 'react-toastify'

const STATUS_COLOR = { active: 'success', draft: 'default', suspended: 'error' }

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)

  const load = () => { productAPI.list().then((r) => { setProducts(r.data.results ?? r.data); setLoading(false) }) }
  useEffect(() => { load() }, [])

  const handleStatus = async (id, status) => {
    try {
      await productAPI.update(id, { status })
      toast.success(`Product ${status}`)
      load()
    } catch { toast.error('Failed') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    await productAPI.delete(id); toast.success('Deleted'); load()
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontFamily: 'Playfair Display', mb: 3 }}>All Products</Typography>
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Shop</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</TableCell>
                  <TableCell>{p.shop_name}</TableCell>
                  <TableCell>{p.category_name || '—'}</TableCell>
                  <TableCell>₹{Number(p.price).toFixed(2)}</TableCell>
                  <TableCell sx={{ color: p.stock <= 5 ? 'error.main' : 'inherit' }}>{p.stock}</TableCell>
                  <TableCell><Chip label={p.status} color={STATUS_COLOR[p.status]} size="small" /></TableCell>
                  <TableCell align="right">
                    {p.status !== 'active'    && <Button size="small" color="success" onClick={() => handleStatus(p.id, 'active')}>Activate</Button>}
                    {p.status !== 'suspended' && <Button size="small" color="warning" onClick={() => handleStatus(p.id, 'suspended')}>Suspend</Button>}
                    <Button size="small" color="error" onClick={() => handleDelete(p.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && <TableRow><TableCell colSpan={7} align="center">No products found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
