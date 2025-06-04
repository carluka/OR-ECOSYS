import type React from "react";
import { Box, Typography } from "@mui/material";

const NoDevicesWarning: React.FC = () => {
  return (
    <Box
      sx={{
        mb: 2,
        p: 3,
        bgcolor: "warning.50",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "warning.200",
      }}
    >
      <Typography variant="body1" color="warning.main" sx={{ fontWeight: 600 }}>
        No devices available in this room
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Start the machines to see available medical devices for monitoring.
      </Typography>
    </Box>
  );
};

export default NoDevicesWarning;
