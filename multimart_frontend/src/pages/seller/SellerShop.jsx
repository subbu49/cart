import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Box, Typography, Card, CardContent, TextField, Button, Chip, Alert } from '@mui/material'
import { shopAPI } from '../../api/endpoints'
import { toast } from 'react-toastify'

const STATUS_COLOR = { approved: 'success', pending: 'warning', suspended: 'error' }

export default function SellerShop() {
  const [shop, setShop]       = useState(null)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    shopAPI.list().then((r) => {
      const s = (r.data.results ?? r.data)[0]
      if (s) { setShop(s); reset(s) }
    })
  }, [reset])

  const onSave = async (data) => {
    setLoading(true)
    try {
      if (shop) { const res = await shopAPI.update(shop.id, data); setShop(res.data); toast.success('Shop updated') }
      else       { const res = await shopAPI.create(data);          setShop(res.data); toast.success('Shop created — pending approval') }
    } catch (e) { toast.error(e.response?.data?.detail || e.response?.data?.[0] || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Playfair Display' }}>My Shop</Typography>
        {shop && <Chip label={shop.status.toUpperCase()} color={STATUS_COLOR[shop.status]} />}
      </Box>
      {shop?.status === 'pending' && <Alert severity="warning" sx={{ mb: 3 }}>Your shop is awaiting admin approval before products can go live.</Alert>}
      {shop?.status === 'suspended' && <Alert severity="error" sx={{ mb: 3 }}>Your shop has been suspended. Contact support.</Alert>}
      <Card sx={{ maxWidth: 600 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit(onSave)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Shop Name"   {...register('shop_name')}   required fullWidth />
            <TextField label="Description" {...register('description')} multiline rows={3} fullWidth />
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Saving…' : shop ? 'Update Shop' : 'Create Shop'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
