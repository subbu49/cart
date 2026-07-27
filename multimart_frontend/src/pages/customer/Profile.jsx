import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Container, Typography, Grid, Card, CardContent, TextField, Button, Box } from '@mui/material'
import { authAPI, addressAPI } from '../../api/endpoints'
import { toast } from 'react-toastify'

export default function Profile() {
  const [profile, setProfile]   = useState(null)
  const [addresses, setAddresses] = useState([])
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    authAPI.getProfile().then((r) => { setProfile(r.data); reset(r.data) })
    addressAPI.list().then((r) => setAddresses(r.data.results ?? r.data))
  }, [reset])

  const onSave = async (data) => {
    try { await authAPI.updateProfile(data); toast.success('Profile updated') }
    catch { toast.error('Update failed') }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontFamily: 'Playfair Display', mb: 4 }}>My Profile</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontFamily: 'Playfair Display', mb: 2 }}>Personal Information</Typography>
              <Box component="form" onSubmit={handleSubmit(onSave)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField label="First Name" {...register('first_name')} fullWidth />
                  <TextField label="Last Name"  {...register('last_name')}  fullWidth />
                </Box>
                <TextField label="Phone" {...register('phone')} fullWidth />
                <Button type="submit" variant="contained">Save Changes</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontFamily: 'Playfair Display', mb: 2 }}>Saved Addresses</Typography>
              {addresses.length === 0 ? <Typography color="text.secondary">No addresses saved.</Typography> : addresses.map((a) => (
                <Box key={a.id} sx={{ p: 2, border: '1px solid', borderColor: a.is_default ? 'secondary.main' : '#e0e0e0', borderRadius: 1, mb: 1 }}>
                  <Typography variant="body2" fontWeight={600}>{a.full_name}</Typography>
                  <Typography variant="body2" color="text.secondary">{a.address}, {a.city}, {a.state}, {a.country} - {a.zip_code}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}
