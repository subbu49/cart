import { createTheme } from '@mui/material/styles'

// MultiMart design direction: deep navy + warm gold + cream/off-white
// Playfair Display headings, Inter body
const theme = createTheme({
  palette: {
    primary:    { main: '#1a2744', light: '#2d3f6b', contrastText: '#fff' },
    secondary:  { main: '#c9a84c', light: '#e2c97e', dark: '#9f7f2e', contrastText: '#1a2744' },
    background: { default: '#f8f6f1', paper: '#ffffff' },
    text:       { primary: '#1a1a2e', secondary: '#5c5c7a' },
    error:      { main: '#c62828' },
    success:    { main: '#2e7d32' },
    warning:    { main: '#e65100' },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontFamily: "'Playfair Display', serif", fontWeight: 700 },
    h2: { fontFamily: "'Playfair Display', serif", fontWeight: 700 },
    h3: { fontFamily: "'Playfair Display', serif", fontWeight: 700 },
    h4: { fontFamily: "'Playfair Display', serif", fontWeight: 700 },
    h5: { fontFamily: "'Playfair Display', serif", fontWeight: 600 },
    h6: { fontFamily: "'Playfair Display', serif", fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 6 },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.08)',
    '0 2px 6px rgba(0,0,0,0.10)',
    '0 4px 12px rgba(0,0,0,0.12)',
    ...Array(21).fill('0 4px 20px rgba(0,0,0,0.14)'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 4, padding: '8px 20px' },
        containedPrimary: { '&:hover': { backgroundColor: '#2d3f6b' } },
        containedSecondary: { color: '#1a2744', '&:hover': { backgroundColor: '#e2c97e' } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: '#c9a84c40' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#1a2744',
            color: '#ffffff',
            fontWeight: 600,
          },
        },
      },
    },
  },
})

export default theme
