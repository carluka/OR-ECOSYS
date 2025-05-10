import {
	Box,
	Button,
	InputLabel,
	OutlinedInput,
	Stack,
	Typography,
} from "@mui/material";

function Login() {
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
						/>
					</Stack>

					<Button variant="contained" color="primary">
						Prijava
					</Button>
				</Stack>
			</Box>
		</Box>
	);
}

export default Login;
