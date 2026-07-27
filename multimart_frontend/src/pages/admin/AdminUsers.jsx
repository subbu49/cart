import { useEffect, useState } from 'react'
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Tabs, Tab, CircularProgress } from '@mui/material'
import { adminAPI } from '../../api/endpoints'

const ROLE_COLOR = { admin: 'error', seller: 'warning', customer: 'success' }

export default function AdminUsers() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState(0)
  const roles                 = [undefined, 'customer', 'seller', 'admin']

  useEffect(() => { setLoading(true); adminAPI.users(roles[tab] ? { role: roles[tab] } : {}).then((r) => { setUsers(r.data); setLoading(false) }) }, [tab])

  return (
    <Box>
      <Typography variant="h4" sx={{ fontFamily: 'Playfair Display', mb: 3 }}>Users</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="All" /><Tab label="Customers" /><Tab label="Sellers" /><Tab label="Admins" />
      </Tabs>
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell><TableCell>Username</TableCell>
                <TableCell>Email</TableCell><TableCell>Role</TableCell>
                <TableCell>Phone</TableCell><TableCell>Joined</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.first_name} {u.last_name}</TableCell>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell><Chip label={u.role} color={ROLE_COLOR[u.role]} size="small" /></TableCell>
                  <TableCell>{u.phone || '—'}</TableCell>
                  <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
