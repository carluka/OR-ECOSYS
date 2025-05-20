import React, { useEffect, useState } from "react";
import {
	Box,
	Button,
	InputLabel,
	OutlinedInput,
	Stack,
	Typography,
	FormControl,
	Select,
	MenuItem,
	Checkbox,
	ListItemText,
	SelectChangeEvent,
} from "@mui/material";
import api from "../../api";

interface Props {
	roomId: number;
	onClose: () => void;
	onAdded: () => void;
}

interface Device {
	idnaprava: number;
	naprava: string;
	soba?: string; // assigned room name, optional
}

const AddDeviceRoom: React.FC<Props> = ({ roomId, onClose, onAdded }) => {
	const [devices, setDevices] = useState<Device[]>([]);
	const [selectedDevices, setSelectedDevices] = useState<number[]>([]);
	const [loading, setLoading] = useState(false);

	// Fetch devices on mount
	useEffect(() => {
		api
			.get("/devices/prikaz") // Adjust endpoint if needed
			.then((res) => {
				if (Array.isArray(res.data.data)) {
					setDevices(res.data.data);
				} else {
					console.error("API response data is not an array:", res.data);
				}
			})
			.catch(console.error);
	}, []);

	const handleSelectChange = (event: SelectChangeEvent<number[]>) => {
		const value = event.target.value;
		// Handle string or number[] depending on multiple select mode
		setSelectedDevices(
			typeof value === "string" ? value.split(",").map(Number) : value
		);
	};

	const handleAdd = async () => {
		if (selectedDevices.length === 0) {
			alert("Izberi vsaj eno napravo.");
			return;
		}

		setLoading(true);
		try {
			// Update each device with new soba_idsoba = roomId
			await Promise.all(
				selectedDevices.map((deviceId) =>
					api.put(`/devices/${deviceId}`, { soba_idsoba: roomId })
				)
			);

			onAdded();
			onClose();
		} catch (err) {
			console.error("Napaka pri dodajanju naprav v sobo:", err);
			alert("Napaka pri dodajanju naprav v sobo.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box
			sx={{
				minHeight: "100%",
				display: "flex",
				justifyContent: "center",
				alignItems: "start",
				pt: 2,
			}}
		>
			<Box
				sx={{
					backgroundColor: "white",
					padding: 3,
					borderRadius: 2,
					boxShadow: 3,
					width: "100%",
				}}
			>
				<Typography variant="h6" gutterBottom>
					Dodaj naprave v sobo
				</Typography>

				<Stack spacing={2}>
					<FormControl fullWidth>
						<InputLabel id="devices-multi-select-label">
							Izberi naprave
						</InputLabel>
						<Select
							labelId="devices-multi-select-label"
							multiple
							value={selectedDevices}
							onChange={handleSelectChange}
							input={<OutlinedInput label="Izberi naprave" />}
							renderValue={(selected) =>
								devices
									.filter((d) => selected.includes(d.idnaprava))
									.map((d) => d.naprava)
									.join(", ")
							}
						>
							{devices.map((device) => (
								<MenuItem key={device.idnaprava} value={device.idnaprava}>
									<Checkbox
										checked={selectedDevices.indexOf(device.idnaprava) > -1}
									/>
									<ListItemText primary={device.naprava} />
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ ml: 2, fontStyle: "italic" }}
									>
										{device.soba ?? "Brez sobe"}
									</Typography>
								</MenuItem>
							))}
						</Select>
					</FormControl>

					<Stack direction="row" spacing={2} justifyContent="flex-end">
						<Button variant="contained" onClick={handleAdd} disabled={loading}>
							Dodaj
						</Button>
					</Stack>
				</Stack>
			</Box>
		</Box>
	);
};

export default AddDeviceRoom;
