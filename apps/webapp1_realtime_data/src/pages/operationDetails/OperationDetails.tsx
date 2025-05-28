"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Chip,
  Stack,
} from "@mui/material"
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts"
import { Visibility, VisibilityOff, SelectAll, ClearAll } from "@mui/icons-material"
import api from "../../api"

interface MeasurementPoint {
  time: string
  value: number
}

interface MeasurementGroup {
  label: string
  deviceId: string
  field: string
  unit: string
  data: MeasurementPoint[]
}

interface Device {
  deviceName: string 
  displayName: string
  metrics: MeasurementGroup[] 
  totalMeasurements: number 
}

interface OperationData {
  idoperacija: number
  datum: string
  cas_zacetka: string
  cas_konca: string
  Pacient: {
    ime: string
    priimek: string
    datum_rojstva: string
  }
  Soba: {
    naziv: string
    lokacija: string
  }
  meritve: MeasurementGroup[]
}

const OperationDetailsPage = () => {
  const { id } = useParams()
  const [operation, setOperation] = useState<OperationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set())
  const [availableDevices, setAvailableDevices] = useState<Device[]>([])

  const extractDeviceName = (deviceId: string): string => {
    const parts = deviceId.split(".")
    return parts[parts.length - 1]
  }

  const getDeviceDisplayName = (deviceName: string): string => {
    const deviceMappings: { [key: string]: string } = {
      nibp_module: "NIBP Monitor (Krvni tlak)",
      capnograph: "Kapnograf (CO2)",
      ecg_module: "EKG Monitor",
      pulse_oximeter: "Pulsni oksimeter (SpO2)",
      temperature_sensor: "Temperaturni senzor",
      mechanical_ventilator: "Mehanski ventilator",
      infusion_pump: "Infuzijska črpalka",
    }

    return deviceMappings[deviceName] || deviceName
  }

  useEffect(() => {
    const fetchOperationDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await api.get<{ data: OperationData }>(`/operations/${id}/data`)
        const operationData = response.data.data

        console.log("Received operation data:", operationData)
        setOperation(operationData)

        if (operationData.meritve) {
          const deviceGroups: { [key: string]: Device } = {}

          operationData.meritve.forEach((group) => {
            const deviceName = extractDeviceName(group.deviceId)

            if (!deviceGroups[deviceName]) {
              deviceGroups[deviceName] = {
                deviceName,
                displayName: getDeviceDisplayName(deviceName),
                metrics: [],
                totalMeasurements: 0,
              }
            }

            deviceGroups[deviceName].metrics.push(group)
            deviceGroups[deviceName].totalMeasurements += group.data.length
          })

          const devices = Object.values(deviceGroups)
          setAvailableDevices(devices)

          const allDeviceNames = new Set(devices.map((d) => d.deviceName))
          setSelectedDevices(allDeviceNames)

          console.log("Available devices:", devices)
        }
      } catch (error) {
        console.error("Error with getting operations data:", error)
        setError("Napaka pri pridobivanju podatkov operacije")
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchOperationDetails()
  }, [id])

  const handleDeviceToggle = (deviceName: string) => {
    const newSelected = new Set(selectedDevices)
    if (newSelected.has(deviceName)) {
      newSelected.delete(deviceName)
    } else {
      newSelected.add(deviceName)
    }
    setSelectedDevices(newSelected)
  }

  const handleSelectAll = () => {
    const allDeviceNames = new Set(availableDevices.map((d) => d.deviceName))
    setSelectedDevices(allDeviceNames)
  }

  const handleDeselectAll = () => {
    setSelectedDevices(new Set())
  }

  const filteredMeritve = operation?.meritve.filter((group) => {
    const deviceName = extractDeviceName(group.deviceId)
    return selectedDevices.has(deviceName)
  }) || []

  const filteredDeviceGroups = availableDevices
    .filter((device) => selectedDevices.has(device.deviceName))
    .map((device) => ({
      ...device,
      metrics: device.metrics.filter((metric) => selectedDevices.has(device.deviceName)),
    }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow">
          <p className="text-sm font-medium">{`Čas: ${new Date(label).toLocaleTimeString("sl-SI")}`}</p>
          <p className="text-sm text-blue-600">
            {`${payload[0].name}: ${payload[0].value} ${payload[0].payload.unit || ""}`}
          </p>
        </div>
      )
    }
    return null
  }

  const getLineColor = (index: number) => {
    const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1", "#d084d0", "#ff6b6b"]
    return colors[index % colors.length]
  }

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Nalaganje podatkov...</Typography>
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

  if (!operation) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Operacija ni bila najdena</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Podrobnosti operacije
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Osnovni podatki
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="Pacient" secondary={`${operation.Pacient.ime} ${operation.Pacient.priimek}`} />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Datum rojstva"
              secondary={new Date(operation.Pacient.datum_rojstva).toLocaleDateString("sl-SI")}
            />
          </ListItem>
          <ListItem>
            <ListItemText primary="Soba" secondary={`${operation.Soba.naziv} (${operation.Soba.lokacija})`} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Datum" secondary={operation.datum} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Čas" secondary={`${operation.cas_zacetka} – ${operation.cas_konca}`} />
          </ListItem>
        </List>
      </Paper>

      {availableDevices.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Izbira naprav za prikaz
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Button startIcon={<SelectAll />} onClick={handleSelectAll} variant="outlined" size="small" sx={{ mr: 1 }}>
              Izberi vse naprave
            </Button>
            <Button startIcon={<ClearAll />} onClick={handleDeselectAll} variant="outlined" size="small">
              Odstrani vse naprave
            </Button>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Izbrane naprave ({selectedDevices.size}/{availableDevices.length}):
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {availableDevices
                .filter((device) => selectedDevices.has(device.deviceName))
                .map((device) => (
                  <Chip
                    key={device.deviceName}
                    label={`${device.displayName} (${device.metrics.length} metrik)`}
                    onDelete={() => handleDeviceToggle(device.deviceName)}
                    color="primary"
                    variant="filled"
                    size="small"
                  />
                ))}
              {selectedDevices.size === 0 && (
                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                  Nobena naprava ni izbrana
                </Typography>
              )}
            </Stack>
          </Box>

          <FormControl component="fieldset">
            <FormLabel component="legend">Dostopne naprave:</FormLabel>
            <FormGroup row>
              {availableDevices.map((device) => (
                <FormControlLabel
                  key={device.deviceName}
                  control={
                    <Checkbox
                      checked={selectedDevices.has(device.deviceName)}
                      onChange={() => handleDeviceToggle(device.deviceName)}
                      icon={<VisibilityOff />}
                      checkedIcon={<Visibility />}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {device.displayName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {device.metrics.length} metrik, {device.totalMeasurements} meritev
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </FormGroup>
          </FormControl>
        </Paper>
      )}

      {operation.meritve && operation.meritve.length > 0 ? (
        <>
          <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
            Vitalni znaki
            {selectedDevices.size < availableDevices.length && (
              <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 2 }}>
                (Prikazano {selectedDevices.size} od {availableDevices.length} naprav)
              </Typography>
            )}
          </Typography>

          {filteredDeviceGroups.length > 0 ? (
            filteredDeviceGroups.map((device) => (
              <Paper sx={{ p: 2, mb: 3 }} key={device.deviceName}>
                <Typography variant="h5" gutterBottom color="primary">
                  {device.displayName}
                  <Chip label={`${device.metrics.length} metrik`} size="small" variant="outlined" sx={{ ml: 2 }} />
                </Typography>

                {device.metrics.map((group, idx) => (
                  <Box key={`${group.deviceId}-${group.field}`} sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      {group.label} ({group.unit})
                    </Typography>

                    <Box sx={{ mb: 2, p: 1, bgcolor: "grey.50", borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Število meritev: {group.data.length} | Min:{" "}
                        {Math.min(...group.data.map((d) => d.value)).toFixed(1)} {group.unit} | Max:{" "}
                        {Math.max(...group.data.map((d) => d.value)).toFixed(1)} {group.unit} | Povprečje:{" "}
                        {(group.data.reduce((sum, d) => sum + d.value, 0) / group.data.length).toFixed(1)} {group.unit}
                      </Typography>
                    </Box>

                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={group.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="time"
                          tickFormatter={(time) => new Date(time).toLocaleTimeString("sl-SI")}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          domain={["dataMin - 5", "dataMax + 5"]}
                          label={{ value: group.unit, angle: -90, position: "insideLeft" }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={getLineColor(idx)}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          name={group.label}
                          connectNulls={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                ))}
              </Paper>
            ))
          ) : (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Alert severity="info">Nobena naprava ni izbrana za prikaz. Izberite naprave zgoraj.</Alert>
            </Paper>
          )}
        </>
      ) : (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Vitalni znaki
          </Typography>
          <Alert severity="info">Za to operacijo ni na voljo meritev vitalnih znakov.</Alert>
        </Paper>
      )}
    </Box>
  )
}

export default OperationDetailsPage
