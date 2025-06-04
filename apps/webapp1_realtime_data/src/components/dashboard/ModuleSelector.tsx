import type React from "react";
import {
  Box,
  Typography,
  Button,
  Divider,
  Chip,
  Checkbox,
  FormControlLabel,
  useTheme,
} from "@mui/material";
import { RestartAlt as RestartAltIcon } from "@mui/icons-material";
import type { DeviceModule, ModuleVisibility } from "../../types/device-types";

interface ModuleSelectorProps {
  availableModules: DeviceModule[];
  moduleVisibility: ModuleVisibility;
  handleVisibilityChange: (moduleId: string, visible: boolean) => void;
  handleResetLayout: () => void;
}

const ModuleSelector: React.FC<ModuleSelectorProps> = ({
  availableModules,
  moduleVisibility,
  handleVisibilityChange,
  handleResetLayout,
}) => {
  const theme = useTheme();
  const selectedModules = availableModules.filter(
    (m) => moduleVisibility[m.id]
  );

  return (
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
          Available Device Modules
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
              availableModules.forEach((m) => {
                if (!moduleVisibility[m.id]) {
                  handleVisibilityChange(m.id, true);
                }
              });
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
              availableModules.forEach((m) => {
                if (moduleVisibility[m.id]) {
                  handleVisibilityChange(m.id, false);
                }
              });
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
        Selected modules ({selectedModules.length}/{availableModules.length}):
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
        {availableModules.map((m) => (
          <FormControlLabel
            key={m.id}
            control={
              <Checkbox
                checked={moduleVisibility[m.id] || false}
                onChange={() =>
                  handleVisibilityChange(m.id, !moduleVisibility[m.id])
                }
              />
            }
            label={m.label}
            sx={{ userSelect: "none" }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ModuleSelector;
