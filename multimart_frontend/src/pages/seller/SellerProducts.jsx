import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem,
  IconButton, CircularProgress,
} from '@mui/material'
import EditIcon   from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon    from '@mui/icons-material/Add'
import { productAPI, categoryAPI } from '../../api/endpoints'
import { toast } from 'react-toastify'

const STATUS_COLOR = { active: 'success', draft: 'default', suspended: 'error' }

export default function SellerProducts() {
  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState([])
  const [open, setOpen]             = useState(false)
  const [editing, setEditing]       = useState(null)
  const [saving, setSaving]         = useState(false)
  const [loading, setLoading]       = useState(true)

  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: { name: '', description: '', price: '', discount: '0', stock: '0', category: '', status: 'active' }
  })

  const load = () => {
    productAPI.list().then((r) => { setProducts(r.data.results ?? r.data); setLoading(false) })
  }

  useEffect(() => {
    load()
    categoryAPI.list().then((r) => setCategories(r.data.results ?? r.data))
  }, [])

  const openAdd = () => {
    setEditing(null)
    reset({ name: '', description: '', price: '', discount: '0', stock: '0', category: '', status: 'active' })
    setOpen(true)
  }

  const openEdit = (p) => {
    setEditing(p)
    reset({
      name:        p.name,
      description: p.description,
      price:       p.price,
      discount:    p.discount,
      stock:       p.stock,
      category:    p.category?.id ?? '',
      status:      p.status,
    })
    setOpen(true)
  }

  const onSave = async (data) => {
    setSaving(true)
    try {
      // Send as plain JSON (no file upload for now)
      const payload = {
        name:        data.name,
        description: data.description,
        price:       data.price,
        discount:    data.discount || '0',
        stock:       data.stock,
        status:      data.status,
        ...(data.category ? { category: data.category } : {}),
      }
      if (editing) {
        await productAPI.updateJSON(editing.id, payload)
        toast.success('Product updated')
      } else {
        await productAPI.createJSON(payload)
        toast.success('Product created')
      }
      setOpen(false)
      load()
    } catch (e) {
      const err = e.response?.data
      const msg = err ? Object.values(err).flat().join(', ') : 'Failed to save'
      toast.error(msg)
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try { await productAPI.delete(id); toast.success('Product deleted'); load() }
    catch { toast.error('Failed to delete') }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Playfair Display' }}>Products</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Product</Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center">No products yet. Add your first product.</TableCell></TableRow>
              ) : products.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.category_name ?? '—'}</TableCell>
                  <TableCell>₹{Number(p.price).toFixed(2)}</TableCell>
                  <TableCell>{p.discount}%</TableCell>
                  <TableCell sx={{ color: Number(p.stock) <= 5 ? 'error.main' : 'inherit', fontWeight: Number(p.stock) <= 5 ? 700 : 400 }}>
                    {p.stock}
                  </TableCell>
                  <TableCell><Chip label={p.status} color={STATUS_COLOR[p.status] || 'default'} size="small" /></TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(p)} title="Edit"><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(p.id)} title="Delete"><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Playfair Display', fontWeight: 700 }}>
          {editing ? 'Edit Product' : 'Add Product'}
        </DialogTitle>
        <DialogContent dividers>
          <Box
            component="form"
            id="product-form"
            onSubmit={handleSubmit(onSave)}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
          >
            <TextField label="Name" {...register('name')} required fullWidth />
            <TextField label="Description" {...register('description')} multiline rows={2} fullWidth />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Price (₹)"
                type="number"
                inputProps={{ step: '0.01', min: '0' }}
                {...register('price')}
                required
                fullWidth
              />
              <TextField
                label="Discount %"
                type="number"
                inputProps={{ min: 0, max: 100, step: '0.01' }}
                {...register('discount')}
                fullWidth
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Stock"
                type="number"
                inputProps={{ min: 0 }}
                {...register('stock')}
                required
                fullWidth
              />
              {/* Category — must use Controller with Select */}
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select {...field} label="Category">
                      <MenuItem value="">— None —</MenuItem>
                      {categories.map((c) => (
                        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Box>

            {/* Status — must use Controller */}
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select {...field} label="Status">
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" form="product-form" variant="contained" disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
