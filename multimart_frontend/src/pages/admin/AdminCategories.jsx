import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, CircularProgress,
} from '@mui/material'
import EditIcon   from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon    from '@mui/icons-material/Add'
import { categoryAPI } from '../../api/endpoints'
import { toast } from 'react-toastify'

export default function AdminCategories() {
  const [cats, setCats]       = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen]       = useState(false)
  const [editing, setEditing] = useState(null)
  const { register, handleSubmit, reset } = useForm()

  const load = () => { categoryAPI.list().then((r) => { setCats(r.data.results ?? r.data); setLoading(false) }) }
  useEffect(() => { load() }, [])

  const openAdd  = () => { setEditing(null); reset({ name: '' }); setOpen(true) }
  const openEdit = (c) => { setEditing(c); reset(c); setOpen(true) }

  const onSave = async (data) => {
    try {
      if (editing) await categoryAPI.update(editing.id, data)
      else         await categoryAPI.create(data)
      toast.success(editing ? 'Category updated' : 'Category created')
      setOpen(false); load()
    } catch (e) { toast.error(e.response?.data?.name?.[0] || 'Failed') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete category?')) return
    try { await categoryAPI.delete(id); toast.success('Deleted'); load() }
    catch { toast.error('Cannot delete — products may be linked.') }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Playfair Display' }}>Categories</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Category</Button>
      </Box>
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper} sx={{ maxWidth: 600 }}>
          <Table>
            <TableHead>
              <TableRow><TableCell>Name</TableCell><TableCell align="right">Actions</TableCell></TableRow>
            </TableHead>
            <TableBody>
              {cats.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(c)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(c.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? 'Edit Category' : 'New Category'}</DialogTitle>
        <DialogContent>
          <Box component="form" id="cat-form" onSubmit={handleSubmit(onSave)} sx={{ pt: 1 }}>
            <TextField label="Category Name" {...register('name')} required fullWidth autoFocus />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" form="cat-form" variant="contained">{editing ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
