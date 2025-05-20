import {
	Box,
	Button,
	InputLabel,
	OutlinedInput,
	Stack,
	Typography,
	Select,
	MenuItem,
	SelectChangeEvent,
} from "@mui/material";
import { useState, useEffect } from "react";
import api from "../../api";

type Props = {
	onDeviceAdded?: () => void;
};

function AddDevice({ onDeviceAdded }: Props) {
	const [tipNaprave, setTipNaprave] = useState<string>("");
	const [nazivNaprave, setNazivNaprave] = useState<string>("");
	const [tipiNaprave, setTipiNaprave] = useState<
		{ idtip_naprave: number; naziv: string }[]
	>([]);

	// Pridobitev tipov naprav

	useEffect(() => {
		api
			.get("/deviceType")
			.then((response) => {
				if (Array.isArray(response.data.data)) {
					setTipiNaprave(response.data.data);
				} else {
					console.error("API response is not an array:", response.data);
				}
			})
			.catch((error) => {
				console.error(
					"Napaka pri pridobivanju podatkov o tipih naprav:",
					error
				);
			});
	}, []);

	const handleChange = (event: SelectChangeEvent) => {
		setTipNaprave(event.target.value as string);
	};

	// Dodajanje nove naprave

	const handleAddDevice = () => {
		const newDevice = {
			naziv: nazivNaprave,
			tip_naprave_idtip_naprave: parseInt(tipNaprave),
			stanje: "Aktivno", // Stanje je trenutno vedno Aktivno
			soba_idsoba: null, // Lokacija je trenutno vedno null
		};
		console.log(newDevice);

		api
			.post("/devices", newDevice)
			.then((response) => {
				console.log("Device added:", response.data);
				if (onDeviceAdded) onDeviceAdded();
			})
			.catch((error) => {
				console.error("Error adding device:", error);
			});
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
					Dodaj Napravo
				</Typography>

				<Stack spacing={2}>
					<Stack spacing={1}>
						<InputLabel htmlFor="ime">Naziv naprave</InputLabel>
						<OutlinedInput
							id="ime"
							name="ime"
							placeholder="Janez"
							fullWidth
							value={nazivNaprave}
							onChange={(e) => setNazivNaprave(e.target.value)}
						/>
					</Stack>

					<Stack spacing={1}>
						<InputLabel htmlFor="tip_naprave">Tip naprave</InputLabel>
						<Select
							id="tip_naprave"
							name="tip_naprave"
							value={tipNaprave}
							onChange={handleChange}
							fullWidth
						>
							{tipiNaprave.map((tip) => (
								<MenuItem
									key={tip.idtip_naprave}
									value={tip.idtip_naprave.toString()}
								>
									{tip.naziv}
								</MenuItem>
							))}
						</Select>
					</Stack>

					{/* Stanje (privzeto Aktivno) */}
					<Stack spacing={1}>
						<InputLabel htmlFor="stanje">Stanje</InputLabel>
						<OutlinedInput
							id="stanje"
							name="stanje"
							value="Aktivno" // Stanje je vedno Aktivno
							disabled
							fullWidth
						/>
					</Stack>

					{/* Lokacija (privzeto 1) 
					<Stack spacing={1}>
						<InputLabel htmlFor="lokacija">Lokacija</InputLabel>
						<OutlinedInput
							id="lokacija"
							name="lokacija"
							value={1} // Lokacija je vedno 1
							disabled
							fullWidth
						/>
					</Stack>
					*/}

					{/* Gumb za dodajanje naprave */}
					<Button variant="contained" color="primary" onClick={handleAddDevice}>
						Dodaj
					</Button>
				</Stack>
			</Box>
		</Box>
	);
}

export default AddDevice;
