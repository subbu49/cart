import { Card, CardContent, Typography, Box } from '@mui/material'

export default function StatCard({ title, value, icon, color = 'primary.main' }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>{title}</Typography>
            <Typography variant="h4" sx={{ fontFamily: 'Playfair Display', fontWeight: 700, color }}>{value}</Typography>
          </Box>
          {icon && <Box sx={{ color, opacity: 0.8, fontSize: 40 }}>{icon}</Box>}
        </Box>
      </CardContent>
    </Card>
  )
}
