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
import api from "../api";

export default function Login() {
	const [email, setEmail] = useState("");
	const [geslo, setGeslo] = useState("");
	const [error, setError] = useState<string | null>(null); // <-- error state
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null); // clear previous error on new submit
		try {
			await api.post("/users/loginAdmin", { email, geslo });
			navigate("/");
		} catch (err: any) {
			console.error(err);
			// Check if error response has message
			if (err.response && err.response.data && err.response.data.message) {
				setError(err.response.data.message);
			} else {
				setError("Prišlo je do napake pri prijavi."); // generic error fallback
			}
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

					{/* Display error message if exists */}
					{error && (
						<Typography color="error" variant="body2" sx={{ mt: 1 }}>
							{error}
						</Typography>
					)}

					<Button type="submit" variant="contained" color="primary">
						Prijava
					</Button>
				</Stack>
			</Box>
		</Box>
	);
}
