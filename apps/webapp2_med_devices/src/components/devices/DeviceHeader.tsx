import type React from "react"
import { Box, Typography } from "@mui/material"
import { Devices as DevicesIcon } from "@mui/icons-material"

const DeviceHeader: React.FC = () => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
        <DevicesIcon sx={{ mr: 1 }} color="primary" />
        Device Management
      </Typography>
      <Typography variant="body1" color="text.secondary">
        View and manage all device records
      </Typography>
    </Box>
  )
}

export default DeviceHeader
