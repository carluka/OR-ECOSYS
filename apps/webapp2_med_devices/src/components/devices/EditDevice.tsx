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

type Device = {
	idnaprava: number;
	naziv: string;
	tip_naprave_idtip_naprave: number;
	stanje: string;
	soba_idsoba: number;
	servisiran: boolean;
};

type Props = {
	device: Device;
	onDeviceUpdated?: () => void;
};

function EditDevice({ device, onDeviceUpdated }: Props) {
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
				console.error("Error fetching device types:", error);
			});

		// Napolni formo z izbrano napravo

		setNazivNaprave(device.naziv);
		setTipNaprave(device.tip_naprave_idtip_naprave.toString());
	}, [device]);

	const handleChange = (event: SelectChangeEvent) => {
		setTipNaprave(event.target.value);
	};

	// Posodobitev naprave

	const handleUpdateDevice = () => {
		const updatedDevice = {
			naziv: nazivNaprave,
			tip_naprave_idtip_naprave: parseInt(tipNaprave),
			stanje: "Aktivno", // Stanje je trenutno vedno Aktivno
			soba_idsoba: 1, // Lokacija je trenutno vedno 1
			servisiran: true,
		};

		console.log(updatedDevice);

		api
			.put(`/devices/${device.idnaprava}`, updatedDevice)
			.then((response) => {
				console.log("Device updated:", response.data);
				if (onDeviceUpdated) onDeviceUpdated();
			})
			.catch((error) => {
				console.error("Error updating device:", error);
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
					Posodobi Napravo
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

					<Stack spacing={1}>
						<InputLabel htmlFor="stanje">Stanje</InputLabel>
						<OutlinedInput
							id="stanje"
							name="stanje"
							value="Aktivno" // status je trenutno vedno Aktiven
							disabled
							fullWidth
						/>
					</Stack>

					<Stack spacing={1}>
						<InputLabel htmlFor="lokacija">Lokacija</InputLabel>
						<OutlinedInput
							id="lokacija"
							name="lokacija"
							value={1} // lokacija je trenutno vedno 1
							disabled
							fullWidth
						/>
					</Stack>

					<Stack spacing={1}>
						<InputLabel htmlFor="servisiran">Servisiran</InputLabel>
						<OutlinedInput
							id="servisiran"
							name="servisiran"
							value="true"
							disabled
							fullWidth
						/>
					</Stack>

					<Button
						variant="contained"
						color="primary"
						onClick={handleUpdateDevice}
					>
						Posodobi
					</Button>
				</Stack>
			</Box>
		</Box>
	);
}

export default EditDevice;
