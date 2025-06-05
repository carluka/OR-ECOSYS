import type React from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Button,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  PowerSettingsNew as PowerIcon,
  PowerOff as PowerOffIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
  Circle as CircleIcon,
} from "@mui/icons-material";

interface DashboardHeaderProps {
  roomId: string;
  roomName: string;
  connected: boolean;
  isActive: boolean;
  isRunLoading: boolean;
  isStopLoading: boolean;
  isWaitingForModal: boolean;
  isConnectDisabled: boolean;
  toggleFullscreen: () => void;
  handleMachines: () => void;
  connectToWebSocket: () => void;
  disconnect: () => void;
  isFullscreen: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  roomId,
  roomName,
  connected,
  isActive,
  isRunLoading,
  isStopLoading,
  isWaitingForModal,
  isConnectDisabled,
  toggleFullscreen,
  handleMachines,
  connectToWebSocket,
  disconnect,
  isFullscreen,
}) => {
  const theme = useTheme();

  return (
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
      <Box
        className="header-title"
        sx={{ display: "flex", alignItems: "center" }}
      >
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
          {decodeURIComponent(roomName)} – Dashboard
        </Typography>
      </Box>

      <Box
        className="header-controls"
        sx={{ display: "flex", alignItems: "center", gap: 3 }}
      >
        <Box
          className="connection-status"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
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
  );
};

export default DashboardHeader;
