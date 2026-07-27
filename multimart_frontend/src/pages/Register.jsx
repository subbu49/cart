import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Divider, ToggleButtonGroup, ToggleButton } from '@mui/material'
import { register as doRegister, selectUser, selectAuthLoading, selectAuthError, clearError } from '../features/auth/authSlice'

const schema = yup.object({
  first_name: yup.string().required('First name is required'),
  last_name:  yup.string().required('Last name is required'),
  username:   yup.string().required('Username is required'),
  email:      yup.string().email().required('Email is required'),
  phone:      yup.string().optional(),
  password:   yup.string().min(8, 'Min 8 characters').required(),
  password2:  yup.string().oneOf([yup.ref('password')], 'Passwords must match').required(),
  role:       yup.string().oneOf(['customer', 'seller']).required(),
})

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user     = useSelector(selectUser)
  const loading  = useSelector(selectAuthLoading)
  const error    = useSelector(selectAuthError)
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: 'customer' },
  })

  useEffect(() => { dispatch(clearError()) }, [dispatch])
  useEffect(() => {
    if (user) navigate(user.role === 'seller' ? '/seller' : '/')
  }, [user, navigate])

  const onSubmit = (data) => dispatch(doRegister(data))

  const fieldError = (key) => {
    const e = error?.[key]
    return Array.isArray(e) ? e[0] : e
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 500 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ fontFamily: 'Playfair Display', textAlign: 'center', mb: 0.5 }}>Create Account</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>Join MultiMart today</Typography>
          {error && typeof error === 'object' && error.detail && <Alert severity="error" sx={{ mb: 2 }}>{error.detail}</Alert>}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="First Name" {...register('first_name')} error={!!errors.first_name || !!fieldError('first_name')} helperText={errors.first_name?.message || fieldError('first_name')} fullWidth />
              <TextField label="Last Name"  {...register('last_name')}  error={!!errors.last_name}  helperText={errors.last_name?.message}  fullWidth />
            </Box>
            <TextField label="Username" {...register('username')} error={!!errors.username || !!fieldError('username')} helperText={errors.username?.message || fieldError('username')} fullWidth />
            <TextField label="Email"    {...register('email')}    error={!!errors.email || !!fieldError('email')}       helperText={errors.email?.message    || fieldError('email')}    fullWidth />
            <TextField label="Phone"    {...register('phone')}    fullWidth />
            <TextField label="Password"  type="password" {...register('password')}  error={!!errors.password}  helperText={errors.password?.message}  fullWidth />
            <TextField label="Confirm Password" type="password" {...register('password2')} error={!!errors.password2} helperText={errors.password2?.message} fullWidth />
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>I am a:</Typography>
              <Controller name="role" control={control} render={({ field }) => (
                <ToggleButtonGroup exclusive value={field.value} onChange={(_, v) => v && field.onChange(v)} fullWidth>
                  <ToggleButton value="customer" sx={{ '&.Mui-selected': { bgcolor: 'primary.main', color: '#fff' } }}>Customer</ToggleButton>
                  <ToggleButton value="seller"   sx={{ '&.Mui-selected': { bgcolor: 'primary.main', color: '#fff' } }}>Seller</ToggleButton>
                </ToggleButtonGroup>
              )} />
            </Box>
            <Button type="submit" variant="contained" color="primary" size="large" disabled={loading} fullWidth>
              {loading ? 'Creating account…' : 'Create Account'}
            </Button>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            Already have an account? <Link to="/login" style={{ color: '#c9a84c', fontWeight: 600 }}>Sign In</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
