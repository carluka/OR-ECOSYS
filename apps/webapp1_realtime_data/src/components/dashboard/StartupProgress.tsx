import type React from "react";
import { Box, Typography, LinearProgress, Paper } from "@mui/material";

interface StartupProgressProps {
  startupProgress: number;
  loadingDuration: number;
}

const StartupProgress: React.FC<StartupProgressProps> = ({
  startupProgress,
  loadingDuration,
}) => {
  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        bgcolor: "primary.50",
        border: "1px solid",
        borderColor: "primary.200",
      }}
    >
      <Box sx={{ mb: 1 }}>
        <Typography
          variant="subtitle2"
          color="primary.main"
          sx={{ fontWeight: 600, mb: 1 }}
        >
          Starting Medical Devices...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Please wait while the system initializes all medical monitoring
          equipment.
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
        <Typography
          variant="body2"
          color="primary.main"
          sx={{ fontWeight: 500, minWidth: 45 }}
        >
          {Math.round(startupProgress)}%
        </Typography>
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, display: "block" }}
      >
        Estimated time remaining:{" "}
        {Math.max(
          0,
          Math.ceil((100 - startupProgress) * (loadingDuration / 100000))
        )}{" "}
        seconds
      </Typography>
    </Paper>
  );
};

export default StartupProgress;
