import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useDeviceContext } from "../../context/DeviceContext"
import { useParams, Navigate } from "react-router-dom"

import NibpModule from "../../components/devices/NIBPModule"
import EKGModule from "../../components/devices/EKGModule"
import SPO2Sensor from "../../components/devices/SPO2Sensor"
import Capnograph from "../../components/devices/Capnograph"
import TemperatureGauge from "../../components/devices/TemperatureGauge"
import InfusionPump from "../../components/devices/InfusionPump"
import Ventilator from "../../components/devices/Ventilator"

import DraggablePanel from "../../components/DraggablePanel/DraggablePanel"
import PatientSelectionModal from "../../components/PatientSelection/PatientSelectionModal"

import api from "../../api"

import {
  Box,
  Button,
  Chip,
  Divider,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  LinearProgress,
  Paper,
} from "@mui/material"
import {
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  PowerSettingsNew as PowerIcon,
  PowerOff as PowerOffIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
  Circle as CircleIcon,
  RestartAlt as RestartAltIcon,
} from "@mui/icons-material"

import "./OperationRoomPage.css"

interface DataPoint {
  time: number
  value: number
}

interface MetricMessage {
  timestamp: string
  metrics: Record<string, number | number[]>
  device_id: string
}

interface GridPosition {
  x: number
  y: number
  width: number
  height: number
}

interface ModuleLayout {
  [key: string]: GridPosition
}

interface ModuleVisibility {
  [key: string]: boolean
}

const MODULES = [
  { id: "temperature", label: "Temperature Gauge" },
  { id: "ekg", label: "EKG Module" },
  { id: "spo2", label: "SPO2 Sensor" },
  { id: "capnograph", label: "Capnograph" },
  { id: "nibp", label: "NIBP Module" },
  { id: "infusion", label: "Infusion Pump" },
  { id: "ventilator", label: "Ventilator" },
]

const MAX_POINTS = 60
const GRID_SIZE = { cols: 12, rows: 16 }
const DEFAULT_LAYOUT: ModuleLayout = {
  temperature: { x: 6, y: 8, width: 3, height: 4 },
  ekg: { x: 0, y: 0, width: 6, height: 6 },
  spo2: { x: 6, y: 3, width: 3, height: 5 },
  capnograph: { x: 0, y: 6, width: 6, height: 6 },
  nibp: { x: 6, y: 0, width: 3, height: 3 },
  infusion: { x: 9, y: 0, width: 3, height: 3 },
  ventilator: { x: 9, y: 3, width: 3, height: 6 },
}

const DEFAULT_VISIBILITY: ModuleVisibility = {
  temperature: true,
  ekg: true,
  spo2: true,
  capnograph: true,
  nibp: true,
  infusion: true,
  ventilator: true,
}

const LOADING_DURATION = 35000 // 35 seconds

const OperationRoomPageNew: React.FC = () => {
  const { roomId } = useParams()
  const { deviceData, updateDeviceData } = useDeviceContext()

  const [connected, setConnected] = useState(false)
  const [co2History, setCo2History] = useState<DataPoint[]>([])
  const [isAvailable, setIsAvailable] = useState(false)
  const [wsUuid, setWsUuid] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(false)

  // Loading states
  const [isRunLoading, setIsRunLoading] = useState(false)
  const [isWaitingForModal, setIsWaitingForModal] = useState(false)
  const [isStartupLoading, setIsStartupLoading] = useState(false)
  const [isStopLoading, setIsStopLoading] = useState(false)
  const [startupProgress, setStartupProgress] = useState(0)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const [moduleLayout, setModuleLayout] = useState<ModuleLayout>(DEFAULT_LAYOUT)
  const [moduleVisibility, setModuleVisibility] = useState<ModuleVisibility>(DEFAULT_VISIBILITY)

  const allMetricsRef = useRef<MetricMessage[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [operationID, setOperationID] = useState<number | null>(null)
  const loadingTimeoutRef = useRef<number | null>(null)

  const theme = useTheme()

  const handleMetric = (msg: MetricMessage) => {
    allMetricsRef.current.push(msg)
    updateDeviceData(msg)

    const ts = new Date(msg.timestamp).getTime()
    if (msg.device_id === "co2.ch0.capnograph") {
      const value = msg.metrics["co2.ch0.capnograph"] as number
      setCo2History((prev) => {
        const next = [...prev, { time: ts, value }]
        return next.length > MAX_POINTS ? next.slice(next.length - MAX_POINTS) : next
      })
    }
  }

  const handlePositionChange = (moduleId: string, position: GridPosition) => {
    setModuleLayout((prev) => ({
      ...prev,
      [moduleId]: position,
    }))
  }

  const handleVisibilityChange = (moduleId: string, visible: boolean) => {
    setModuleVisibility((prev) => ({
      ...prev,
      [moduleId]: visible,
    }))
  }

  const handleResetLayout = () => {
    setModuleLayout(DEFAULT_LAYOUT)
    setModuleVisibility(DEFAULT_VISIBILITY)
  }

  const handlePatientModalClose = () => {
    setShowPatientModal(false)
    setIsWaitingForModal(false)
  }

  const handlePatientSelection = () => {
    // Called when patient is selected and confirmed
    setShowPatientModal(false)
    setIsWaitingForModal(false)
    setIsStartupLoading(true)
    setStartupProgress(0)

    // Start progress tracking
    const progressInterval = 100 // Update every 100ms
    const totalDuration = LOADING_DURATION
    let elapsed = 0

    progressIntervalRef.current = setInterval(() => {
      elapsed += progressInterval
      const progress = Math.min((elapsed / totalDuration) * 100, 100)
      setStartupProgress(progress)

      if (elapsed >= totalDuration) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
        }
      }
    }, progressInterval)

    // Start 35-second loading period
    loadingTimeoutRef.current = setTimeout(() => {
      setIsStartupLoading(false)
      setIsRunLoading(false)
      setStartupProgress(0)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }, LOADING_DURATION)
  }

  useEffect(() => {
    const fetchActiveStatus = async () => {
      try {
        const res = await api.get(`/rooms/${roomId}/status`)
        if (res.data && typeof res.data.active === "boolean") {
          setIsActive(res.data.active)
          if (res.data.active && res.data.wsUuid) {
            setIsAvailable(true)
            setWsUuid(res.data.wsUuid)
          }
        }
      } catch (err) {
        console.error("Failed to fetch active status", err)
      }
    }

    if (roomId) {
      fetchActiveStatus()
    }
  }, [roomId])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F11") {
        event.preventDefault()
        toggleFullscreen()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isFullscreen])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

  const openSocket = (uuid: string) => {
    const ws = new WebSocket(`wss://data.or-ecosystem.eu/ws/medical-device/${uuid}`)
    wsRef.current = ws

    ws.onopen = () => setConnected(true)
    ws.onmessage = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data)
        const messages = Array.isArray(data) ? data : [data]
        messages.forEach(handleMetric)
      } catch (err) {
        console.error("Failed to parse message", err)
      }
    }
    ws.onerror = () => ws.close()
    ws.onclose = () => {
      setConnected(false)
      wsRef.current = null
    }
  }

  const handleMachines = async () => {
    if (isActive) {
      // Stop machines
      setIsStopLoading(true)
      try {
        await api.post(`/rooms/${roomId}/stopDevices`)
      } catch (err) {
        console.error("Failed to stop devices", err)
      }
      wsRef.current?.close()
      setConnected(false)
      setIsActive(false)
      setIsAvailable(false)
      setWsUuid(null)
      setIsStopLoading(false)

      // Clear any loading states
      setIsRunLoading(false)
      setIsWaitingForModal(false)
      setIsStartupLoading(false)
      setStartupProgress(0)
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    } else {
      // Start machines
      setIsRunLoading(true)
      setIsWaitingForModal(true)

      try {
        const res = await api.post(`/rooms/${roomId}/startDevices`)
        if (res.data.status === "available" && res.data.wsUuid) {
          setIsAvailable(true)
          setWsUuid(res.data.wsUuid)
          setIsActive(true)
          setShowPatientModal(true)
          setOperationID(res.data.operationID)
        }
      } catch (err) {
        console.error("Failed to deploy devices", err)
        // Reset loading states on error
        setIsRunLoading(false)
        setIsWaitingForModal(false)
      }
    }
  }

  const connectToWebSocket = async () => {
    if (connected || !wsUuid) return
    try {
      openSocket(wsUuid)
    } catch (err) {
      console.error("Failed to connect", err)
    }
  }

  const disconnect = () => {
    wsRef.current?.close()
    setConnected(false)
  }

  if (!roomId) {
    return <Navigate to="/" replace />
  }

  const nibpData = {
    systolic: deviceData["bps.ch0.nibp_module"]?.metrics["bps.ch0.nibp_module"] ?? null,
    diastolic: deviceData["bpd.ch0.nibp_module"]?.metrics["bpd.ch0.nibp_module"] ?? null,
    map: deviceData["bpa.ch0.nibp_module"]?.metrics["bpa.ch0.nibp_module"] ?? null,
  }

  const waveformRaw = deviceData["ecgWaveform.ch0.ecg_module"]?.metrics["ecgWaveform.ch0.ecg_module"]
  const ecgWaveform = typeof waveformRaw === "string" ? JSON.parse(waveformRaw) : (waveformRaw ?? [])

  const ekgData = {
    heartRate: deviceData["heartRate.ch0.ecg_module"]?.metrics["heartRate.ch0.ecg_module"] ?? null,
    rrInterval: deviceData["rrInterval.ch0.ecg_module"]?.metrics["rrInterval.ch0.ecg_module"] ?? null,
    qrsDuration: deviceData["qrsDuration.ch0.ecg_module"]?.metrics["qrsDuration.ch0.ecg_module"] ?? null,
    ecgWaveform,
  }

  const spo2SensorData = {
    oxygenSaturation: deviceData["oxygen_saturation.ch0.spo2"]?.metrics["oxygen_saturation.ch0.spo2"] ?? null,
    pulse: deviceData["pulse.ch0.spo2"]?.metrics["pulse.ch0.spo2"] ?? null,
  }

  const capnographData = {
    co2: deviceData["co2.ch0.capnograph"]?.metrics["co2.ch0.capnograph"] ?? null,
    rf: deviceData["rf.ch0.capnograph"]?.metrics["rf.ch0.capnograph"] ?? null,
    co2History,
  }

  const temperature =
    deviceData["temperature.ch0.temperature_gauge"]?.metrics["temperature.ch0.temperature_gauge"] ?? null

  const infusionPumpData = {
    flowRate: deviceData["flowRate.ch0.infusion_pump"]?.metrics["flowRate.ch0.infusion_pump"] ?? null,
    volumeTotal: deviceData["volumeTotal.ch0.infusion_pump"]?.metrics["volumeTotal.ch0.infusion_pump"] ?? null,
  }

  const ventilatorData = {
    tidalVolume: deviceData["vol.ch0.mechanical_ventilator"]?.metrics["vol.ch0.mechanical_ventilator"] ?? null,
    respiratoryRate: deviceData["rf.ch0.mechanical_ventilator"]?.metrics["rf.ch0.mechanical_ventilator"] ?? null,
    fio2: deviceData["ox_con.ch0.mechanical_ventilator"]?.metrics["ox_con.ch0.mechanical_ventilator"] ?? null,
    pip: deviceData["pip.ch0.mechanical_ventilator"]?.metrics["pip.ch0.mechanical_ventilator"] ?? null,
    peep: deviceData["peep.ch0.mechanical_ventilator"]?.metrics["peep.ch0.mechanical_ventilator"] ?? null,
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current
          .requestFullscreen()
          .then(() => setIsFullscreen(true))
          .catch((err) => console.error(`Error enabling fullscreen: ${err.message}`))
      }
    } else {
      if (document.exitFullscreen) {
        document
          .exitFullscreen()
          .then(() => setIsFullscreen(false))
          .catch((err) => console.error(`Error exiting fullscreen: ${err.message}`))
      }
    }
  }

  const selectedModules = MODULES.filter((m) => moduleVisibility[m.id])

  // Determine if Connect button should be disabled
  const isConnectDisabled = !isAvailable || connected || isRunLoading || isStartupLoading

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: theme.palette.grey[50],
        overflow: "hidden",
      }}
    >
      {isFullscreen && (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: "rgba(0,0,0,0.6)",
            borderRadius: 1,
            px: 2,
            py: 1,
            zIndex: 1300,
          }}
        >
          <Typography variant="body2" color="common.white">
            Press F11 or click Exit Fullscreen to return
          </Typography>
        </Box>
      )}

      <Box
        className={`operation-room-content${isFullscreen ? " fullscreen" : ""}`}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {!isFullscreen && (
          <Box
            className="header-container"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              bgcolor: "background.paper",
              borderBottom: `1px solid ${theme.palette.divider}`,
              px: 3,
              py: 2,
            }}
          >
            <Box className="header-title" sx={{ display: "flex", alignItems: "center" }}>
              <Box
                className="header-icon"
                sx={{
                  mr: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 46,
                  height: 46,
                  bgcolor: "primary.main",
                  borderRadius: "50%",
                  color: "common.white",
                }}
              >
                <Typography variant="h6" component="span">
                  OR
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {decodeURIComponent(roomId)} – Dashboard
              </Typography>
            </Box>

            <Box className="header-controls" sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Box className="connection-status" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircleIcon
                  fontSize="small"
                  sx={{
                    color: connected ? "success.main" : "error.main",
                  }}
                />
                <Typography variant="body2">
                  Status:{" "}
                  <Box component="span" sx={{ fontWeight: 500 }}>
                    {connected ? "Connected" : "Disconnected"}
                  </Box>
                </Typography>
              </Box>

              <Box className="action-buttons" sx={{ display: "flex", gap: 1 }}>
                <Tooltip title="Toggle Fullscreen (F11)">
                  <IconButton
                    onClick={toggleFullscreen}
                    size="small"
                    sx={{
                      bgcolor: "background.paper",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                  </IconButton>
                </Tooltip>

                <Tooltip title={isActive ? "Stop Machines" : "Run Machines"}>
                  <Button
                    onClick={handleMachines}
                    variant={isActive ? "outlined" : "contained"}
                    color={isActive ? "warning" : "primary"}
                    startIcon={
                      isStopLoading ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : isRunLoading ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : isActive ? (
                        <PowerOffIcon />
                      ) : (
                        <PowerIcon />
                      )
                    }
                    size="small"
                    sx={{
                      textTransform: "none",
                      minWidth: 100,
                    }}
                    disabled={isRunLoading || isStopLoading}
                  >
                    {isStopLoading
                      ? "Stopping..."
                      : isRunLoading
                        ? isWaitingForModal
                          ? "Loading..."
                          : "Starting..."
                        : isActive
                          ? "Stop"
                          : "Run"}
                  </Button>
                </Tooltip>

                <PatientSelectionModal
                  open={showPatientModal}
                  onClose={handlePatientModalClose}
                  onPatientSelected={handlePatientSelection}
                  operationID={operationID}
                />

                <Tooltip title="Connect WebSocket">
                  <Button
                    onClick={connectToWebSocket}
                    disabled={isConnectDisabled}
                    variant="outlined"
                    color="success"
                    startIcon={<LinkIcon />}
                    size="small"
                    sx={{
                      textTransform: "none",
                      ...(isConnectDisabled
                        ? {
                            color: theme.palette.action.disabled,
                            borderColor: theme.palette.action.disabledBackground,
                          }
                        : {}),
                    }}
                  >
                    Connect
                  </Button>
                </Tooltip>

                <Tooltip title="Disconnect WebSocket">
                  <Button
                    onClick={disconnect}
                    disabled={!connected}
                    variant="outlined"
                    color="error"
                    startIcon={<LinkOffIcon />}
                    size="small"
                    sx={{
                      textTransform: "none",
                      ...(!connected
                        ? {
                            color: theme.palette.action.disabled,
                            borderColor: theme.palette.action.disabledBackground,
                          }
                        : {}),
                    }}
                  >
                    Disconnect
                  </Button>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        )}

        {/* Progress Bar for Startup Loading */}
        {isStartupLoading && !isFullscreen && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: "primary.50", border: "1px solid", borderColor: "primary.200" }}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 600, mb: 1 }}>
                Starting Medical Devices...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Please wait while the system initializes all medical monitoring equipment.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <LinearProgress
                variant="determinate"
                value={startupProgress}
                sx={{
                  flexGrow: 1,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "primary.100",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    bgcolor: "primary.main",
                  },
                }}
              />
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500, minWidth: 45 }}>
                {Math.round(startupProgress)}%
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              Estimated time remaining: {Math.max(0, Math.ceil((100 - startupProgress) * (LOADING_DURATION / 100000)))}{" "}
              seconds
            </Typography>
          </Paper>
        )}

        {!isFullscreen && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Module Visibility
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    MODULES.forEach((m) => {
                      if (!moduleVisibility[m.id]) {
                        handleVisibilityChange(m.id, true)
                      }
                    })
                  }}
                  sx={{
                    textTransform: "none",
                    bgcolor: theme.palette.primary.main,
                    "&:hover": { bgcolor: theme.palette.primary.dark },
                  }}
                >
                  SELECT ALL
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  color="secondary"
                  onClick={() => {
                    MODULES.forEach((m) => {
                      if (moduleVisibility[m.id]) {
                        handleVisibilityChange(m.id, false)
                      }
                    })
                  }}
                  sx={{
                    textTransform: "none",
                    borderColor: theme.palette.secondary.main,
                    color: theme.palette.secondary.main,
                    "&:hover": {
                      borderColor: theme.palette.secondary.dark,
                      bgcolor: theme.palette.secondary.light,
                    },
                  }}
                >
                  CLEAR ALL
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RestartAltIcon />}
                  onClick={handleResetLayout}
                  sx={{
                    textTransform: "none",
                    ml: { xs: 0, sm: 2 },
                  }}
                >
                  Reset Layout
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" sx={{ mb: 1 }}>
              Selected modules ({selectedModules.length}/{MODULES.length}):
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {selectedModules.length > 0 ? (
                selectedModules.map((m) => (
                  <Chip
                    key={m.id}
                    label={m.label}
                    size="small"
                    onDelete={() => handleVisibilityChange(m.id, false)}
                    sx={{
                      bgcolor: theme.palette.primary.dark,
                      color: theme.palette.primary.contrastText,
                      "& .MuiChip-deleteIcon": {
                        color: theme.palette.primary.contrastText,
                      },
                    }}
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  None
                </Typography>
              )}
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {MODULES.map((m) => (
                <FormControlLabel
                  key={m.id}
                  control={
                    <Checkbox
                      checked={moduleVisibility[m.id]}
                      onChange={() => handleVisibilityChange(m.id, !moduleVisibility[m.id])}
                    />
                  }
                  label={m.label}
                  sx={{ userSelect: "none" }}
                />
              ))}
            </Box>
          </Box>
        )}

        <Box
          className="dashboard-grid-container"
          sx={{
            flexGrow: 1,
            display: "grid",
            gridTemplateColumns: `repeat(${GRID_SIZE.cols}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE.rows}, ${isFullscreen ? "80px" : "60px"})`,
            gap: 1,
            p: 1,
            position: "relative",
          }}
        >
          {moduleVisibility.temperature && (
            <DraggablePanel
              id="temperature"
              gridPosition={moduleLayout.temperature}
              onPositionChange={handlePositionChange}
              gridSize={GRID_SIZE}
              isVisible
            >
              <TemperatureGauge temperature={temperature} />
            </DraggablePanel>
          )}

          {moduleVisibility.ekg && (
            <DraggablePanel
              id="ekg"
              gridPosition={moduleLayout.ekg}
              onPositionChange={handlePositionChange}
              gridSize={GRID_SIZE}
              isVisible
            >
              <EKGModule {...ekgData} />
            </DraggablePanel>
          )}

          {moduleVisibility.spo2 && (
            <DraggablePanel
              id="spo2"
              gridPosition={moduleLayout.spo2}
              onPositionChange={handlePositionChange}
              gridSize={GRID_SIZE}
              isVisible
            >
              <SPO2Sensor {...spo2SensorData} />
            </DraggablePanel>
          )}

          {moduleVisibility.capnograph && (
            <DraggablePanel
              id="capnograph"
              gridPosition={moduleLayout.capnograph}
              onPositionChange={handlePositionChange}
              gridSize={GRID_SIZE}
              isVisible
            >
              <Capnograph {...capnographData} />
            </DraggablePanel>
          )}

          {moduleVisibility.nibp && (
            <DraggablePanel
              id="nibp"
              gridPosition={moduleLayout.nibp}
              onPositionChange={handlePositionChange}
              gridSize={GRID_SIZE}
              isVisible
            >
              <NibpModule {...nibpData} />
            </DraggablePanel>
          )}

          {moduleVisibility.infusion && (
            <DraggablePanel
              id="infusion"
              gridPosition={moduleLayout.infusion}
              onPositionChange={handlePositionChange}
              gridSize={GRID_SIZE}
              isVisible
            >
              <InfusionPump {...infusionPumpData} />
            </DraggablePanel>
          )}

          {moduleVisibility.ventilator && (
            <DraggablePanel
              id="ventilator"
              gridPosition={moduleLayout.ventilator}
              onPositionChange={handlePositionChange}
              gridSize={GRID_SIZE}
              isVisible
            >
              <Ventilator {...ventilatorData} />
            </DraggablePanel>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default OperationRoomPageNew
