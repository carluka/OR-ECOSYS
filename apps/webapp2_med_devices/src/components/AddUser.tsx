import {
	Box,
	Button,
	Grid,
	InputLabel,
	OutlinedInput,
	Stack,
	Typography,
	Select,
	MenuItem,
	SelectChangeEvent,
} from "@mui/material";
import { useState } from "react";

function AddUser() {
	const [tipZaposlenega, setTipZaposlenega] = useState("");

	const handleChange = (event: SelectChangeEvent) => {
		setTipZaposlenega(event.target.value as string);
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
				sx={{
					backgroundColor: "white",
					padding: 4,
					borderRadius: 2,
					boxShadow: 3,
					minWidth: 320,
				}}
			>
				<Typography variant="h4" gutterBottom>
					Dodaj Uporabnika
				</Typography>

				<Stack spacing={2}>
					<Stack spacing={1}>
						<InputLabel htmlFor="ime">Ime</InputLabel>
						<OutlinedInput id="ime" name="ime" placeholder="Janez" fullWidth />
					</Stack>

					<Stack spacing={1}>
						<InputLabel htmlFor="priimek">Priimek</InputLabel>
						<OutlinedInput
							id="priimek"
							name="priimek"
							placeholder="Novak"
							fullWidth
						/>
					</Stack>

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
						<InputLabel htmlFor="tip_zaposlenega">Tip zaposlenega</InputLabel>
						<Select
							id="tip_zaposlenega"
							name="tip_zaposlenega"
							value={tipZaposlenega}
							onChange={handleChange}
							fullWidth
						>
							<MenuItem value="Zdravnik">Zdravnik</MenuItem>
							<MenuItem value="Medicinska sestra">Medicinska sestra</MenuItem>
							<MenuItem value="Administrator">Administrator</MenuItem>
						</Select>
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
						Dodaj
					</Button>
				</Stack>
			</Box>
		</Box>
	);
}

export default AddUser;
