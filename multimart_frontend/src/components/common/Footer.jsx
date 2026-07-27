import { Box, Typography, Divider } from '@mui/material'

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: 'primary.main', color: '#9aabcc', py: 4, px: 4, mt: 'auto' }}>
      <Divider sx={{ borderColor: 'secondary.main', mb: 3, opacity: 0.3 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" sx={{ fontFamily: 'Playfair Display', color: 'secondary.main' }}>MultiMart</Typography>
        <Typography variant="body2">Multi-Vendor E-Commerce Platform</Typography>
        <Typography variant="body2">© 2026 MultiMart. All rights reserved.</Typography>
      </Box>
    </Box>
  )
}
