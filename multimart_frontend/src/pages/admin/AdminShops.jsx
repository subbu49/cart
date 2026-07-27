import { useEffect, useState } from 'react'
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, CircularProgress, Tabs, Tab } from '@mui/material'
import { shopAPI } from '../../api/endpoints'
import { toast } from 'react-toastify'

const STATUS_COLOR = { approved: 'success', pending: 'warning', suspended: 'error' }

export default function AdminShops() {
  const [shops, setShops]     = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState(0)
  const statuses              = ['pending', 'approved', 'suspended']

  const load = (status) => { setLoading(true); shopAPI.list({ status }).then((r) => { setShops(r.data.results ?? r.data); setLoading(false) }) }
  useEffect(() => { load(statuses[tab]) }, [tab])

  const approve = async (id) => { await shopAPI.approve(id); toast.success('Shop approved'); load(statuses[tab]) }
  const suspend = async (id) => { await shopAPI.suspend(id); toast.success('Shop suspended'); load(statuses[tab]) }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontFamily: 'Playfair Display', mb: 3 }}>Shops</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Pending" /><Tab label="Approved" /><Tab label="Suspended" />
      </Tabs>
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Shop Name</TableCell><TableCell>Owner</TableCell>
                <TableCell>Status</TableCell><TableCell>Products</TableCell>
                <TableCell>Created</TableCell><TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shops.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.shop_name}</TableCell>
                  <TableCell>{s.owner_username}</TableCell>
                  <TableCell><Chip label={s.status} color={STATUS_COLOR[s.status]} size="small" /></TableCell>
                  <TableCell>{s.product_count}</TableCell>
                  <TableCell>{new Date(s.created_at).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    {s.status !== 'approved'   && <Button size="small" color="success" onClick={() => approve(s.id)}>Approve</Button>}
                    {s.status !== 'suspended'  && <Button size="small" color="error"   onClick={() => suspend(s.id)}>Suspend</Button>}
                  </TableCell>
                </TableRow>
              ))}
              {shops.length === 0 && <TableRow><TableCell colSpan={6} align="center">No shops found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
