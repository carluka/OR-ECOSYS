import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import {
	Box,
	Paper,
	TextField,
	Button,
	Typography,
	Stack,
	Alert,
} from "@mui/material";

export default function Login() {
	const [email, setEmail] = useState("");
	const [geslo, setGeslo] = useState("");
	const [errorMessage, setErrorMessage] = useState<string>("");
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMessage("");
		try {
			await api.post("/users/login", { email, geslo });
			navigate("/");
		} catch (err: any) {
			console.error(err);
			if (err.response?.data?.message) {
				setErrorMessage(err.response.data.message);
			} else {
				setErrorMessage("Pri prijavi je prišlo do napake. Poskusi znova.");
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
				px: 2,
			}}
		>
			<Paper
				elevation={4}
				sx={{
					maxWidth: 400,
					width: "100%",
					p: 4,
					borderRadius: 2,
				}}
			>
				<Typography
					variant="h4"
					component="h1"
					align="center"
					gutterBottom
					sx={{ fontWeight: 700, mb: 3 }}
				>
					Sign In
				</Typography>

				{errorMessage && (
					<Alert severity="error" sx={{ mb: 3 }}>
						{errorMessage}
					</Alert>
				)}

				<Stack component="form" spacing={3} onSubmit={handleSubmit} noValidate>
					<TextField
						label="Email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						fullWidth
						autoFocus
					/>

					<TextField
						label="Password"
						type="password"
						value={geslo}
						onChange={(e) => setGeslo(e.target.value)}
						required
						sx={{ mb: 5 }}
						fullWidth
					/>

					<Button
						type="submit"
						variant="contained"
						size="large"
						fullWidth
						sx={{
							textTransform: "none",
							py: 1.5,
						}}
					>
						Sign In
					</Button>
				</Stack>
			</Paper>
		</Box>
	);
}
