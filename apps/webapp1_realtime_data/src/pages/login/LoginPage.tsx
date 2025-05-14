import {
  Box,
  Button,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [geslo, setGeslo] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/users/login", { email, geslo });
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          backgroundColor: "white",
          padding: 4,
          borderRadius: 2,
          boxShadow: 3,
          minWidth: 320,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Prijava
        </Typography>

        <Stack spacing={2}>
          <Stack spacing={1}>
            <InputLabel htmlFor="email">Email</InputLabel>
            <OutlinedInput
              id="email"
              name="email"
              type="email"
              placeholder="janez.novak@gmail.com"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Stack>

          <Stack spacing={1}>
            <InputLabel htmlFor="password">Geslo</InputLabel>
            <OutlinedInput
              id="password"
              name="password"
              type="password"
              placeholder="Vnesite vaše geslo"
              fullWidth
              value={geslo}
              onChange={(e) => setGeslo(e.target.value)}
            />
          </Stack>

          <Button type="submit" variant="contained" color="primary">
            Prijava
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
