import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Avatar,
  Stack,
} from "@mui/material"
import {
  Assignment,
  Search,
  Visibility,
  Person,
  Room,
  Schedule,
  CalendarToday,
  AccessTime,
  FilterList,
} from "@mui/icons-material"
import api from "../../api"

interface Operation {
  idoperacija: number
  datum: string
  cas_zacetka: string
  cas_konca: string
  Pacient: {
    idpacient: number
    ime: string
    priimek: string
  }
  Soba: {
    idsoba: number
    naziv: string
  }
}

interface ApiResponse {
  data: Operation[]
}

const OperationsPage = () => {
  const [operations, setOperations] = useState<Operation[]>([])
  const [filteredOperations, setFilteredOperations] = useState<Operation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchOperations = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get<ApiResponse>("/operations")
        console.log("Fetched operations:", response.data.data)
        const sortedOperations = response.data.data.sort((a, b) => {
          const dateA = new Date(`${a.datum}T${a.cas_zacetka}`)
          const dateB = new Date(`${b.datum}T${b.cas_zacetka}`)
          return dateB.getTime() - dateA.getTime()
        })
        setOperations(sortedOperations)
        setFilteredOperations(sortedOperations)
      } catch (error) {
        console.error("Error fetching operations:", error)
        setError("Error loading operations data")
      } finally {
        setLoading(false)
      }
    }

    fetchOperations()
  }, [])

  useEffect(() => {
    const filtered = operations.filter(
      (operation) =>
        operation.Pacient?.ime.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operation.Pacient?.priimek.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operation.Soba?.naziv.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operation.idoperacija.toString().includes(searchTerm),
    )
    const sortedFiltered = filtered.sort((a, b) => {
      const dateA = new Date(`${a.datum}T${a.cas_zacetka}`)
      const dateB = new Date(`${b.datum}T${b.cas_zacetka}`)
      return dateB.getTime() - dateA.getTime()
    })
    setFilteredOperations(sortedFiltered)
  }, [searchTerm, operations])

  const handleRowClick = (operationId: number) => {
    navigate(`/operations/${operationId}`)
  }

  const getOperationStatus = (startTime: string, endTime: string, date: string) => {
    // If operation has start time but no end time, it's in progress
    if (startTime && (!endTime || endTime === "" || endTime === null)) {
      return { status: "In Progress", color: "warning" as const }
    }
    // If operation has both start and end time, it's completed
    if (startTime && endTime) {
      return { status: "Completed", color: "success" as const }
    }
    // Default case (shouldn't happen with valid data)
    return { status: "Scheduled", color: "info" as const }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`)
    const end = new Date(`2000-01-01T${endTime}`)
    const diffMs = end.getTime() - start.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${diffHours}h ${diffMinutes}m`
  }

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading operations...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
          <Assignment sx={{ mr: 1 }} color="primary" />
          Operations Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View data history for all surgical operations
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2, mb: 3 }}>
        <Card variant="outlined">
          <CardContent sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              {operations.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Operations
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {
                operations.filter(
                  (op) => getOperationStatus(op.cas_zacetka, op.cas_konca, op.datum).status === "In Progress",
                ).length
              }
            </Typography>
            <Typography variant="body2" color="text.secondary">
              In Progress
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {
                operations.filter(
                  (op) => getOperationStatus(op.cas_zacetka, op.cas_konca, op.datum).status === "Completed",
                ).length
              }
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <TextField
            placeholder="Search by patient name, room, or operation ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, minWidth: 300 }}
            size="small"
          />
          <Tooltip title="Advanced Filters">
            <IconButton>
              <FilterList />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      <Paper sx={{ overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell sx={{ fontWeight: 600 }}>Operation ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Patient</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Room</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOperations.length > 0 ? (
                filteredOperations.map((operation) => {
                  const { status, color } = getOperationStatus(
                    operation.cas_zacetka,
                    operation.cas_konca,
                    operation.datum,
                  )
                  return (
                    <TableRow
                      key={operation.idoperacija}
                      onClick={() => handleRowClick(operation.idoperacija)}
                      sx={{
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                        transition: "background-color 0.2s",
                      }}
                    >
                      <TableCell>
                        <Chip label={`#${operation.idoperacija}`} size="small" variant="outlined" color="primary" />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                            <Person fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {operation.Pacient?.ime} {operation.Pacient?.priimek}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {operation.Pacient?.idpacient}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Room fontSize="small" color="action" />
                          <Typography variant="body2">{operation.Soba?.naziv}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <CalendarToday fontSize="small" color="action" />
                          <Typography variant="body2">{formatDate(operation.datum)}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <AccessTime fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                              Start:
                            </Typography>
                            <Typography variant="body2">{formatTime(operation.cas_zacetka)}</Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <AccessTime fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                              End:
                            </Typography>
                            <Typography variant="body2">{formatTime(operation.cas_konca)}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Schedule fontSize="small" color="action" />
                          <Typography variant="body2">
                            {calculateDuration(operation.cas_zacetka, operation.cas_konca)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={status} color={color} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {searchTerm ? "No operations found matching your search." : "No operations available."}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {filteredOperations.length > 0 && (
        <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredOperations.length} of {operations.length} operations
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default OperationsPage
