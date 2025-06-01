import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Typography, useTheme } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export default function NotFoundPage() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      <ErrorOutlineIcon
        sx={{
          fontSize: 64,
          color: "error.main",
          mb: 2,
        }}
      />
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: 700,
          color: "text.primary",
          textAlign: "center",
          mb: 1,
        }}
      >
        404 — Page Not Found
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: "text.secondary",
          textAlign: "center",
          mb: 3,
          maxWidth: 400,
        }}
      >
        Oops! The page you’re looking for doesn’t exist. It might have been
        moved or deleted.
      </Typography>
      <Button
        component={RouterLink}
        to="/"
        variant="contained"
        color="primary"
        size="large"
        sx={{
          textTransform: "none",
          px: 4,
          py: 1.5,
          borderRadius: 2,
          boxShadow: 3,
          "&:hover": {
            boxShadow: 6,
          },
        }}
      >
        Go to Home
      </Button>
    </Box>
  );
}
