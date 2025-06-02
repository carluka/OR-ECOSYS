import type React from "react"
import { Box, Typography } from "@mui/material"
import { MeetingRoom } from "@mui/icons-material"

export const RoomHeader: React.FC = () => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
        <MeetingRoom sx={{ mr: 1 }} color="primary" />
        Operation Rooms Management
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Manage operation rooms and their assigned devices
      </Typography>
    </Box>
  )
}
