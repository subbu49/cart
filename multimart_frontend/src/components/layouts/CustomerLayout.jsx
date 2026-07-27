import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import Navbar from '../common/Navbar'
import Footer from '../common/Footer'

export default function CustomerLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flex: 1, pt: 8 }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  )
}
