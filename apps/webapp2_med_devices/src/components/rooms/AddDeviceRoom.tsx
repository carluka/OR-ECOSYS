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
	soba?: string;
	soba_idsoba: number | null;
}

const AddDeviceRoom: React.FC<Props> = ({ roomId, onClose, onAdded }) => {
	const [devices, setDevices] = useState<Device[]>([]);
	const [selectedDevices, setSelectedDevices] = useState<number[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		api
			.get("/devices/prikaz")
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
			await Promise.all(
				selectedDevices.map((deviceId) =>
					api.put(`/devices/${deviceId}`, { soba_idsoba: roomId })
				)
			);

			onAdded();
			onClose();
		} catch (err) {
			console.error("Error adding devices to room:", err);
			alert("Error adding devices to room.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Stack spacing={2}>
				<FormControl fullWidth>
					<InputLabel id="devices-multi-select-label">
						Choose devices
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
						{devices.map((device) => {
							const isAssignedToRoom = device.soba_idsoba === roomId;
							return (
								<MenuItem
									key={device.idnaprava}
									value={device.idnaprava}
									disabled={isAssignedToRoom}
								>
									<Checkbox
										checked={selectedDevices.includes(device.idnaprava)}
										disabled={isAssignedToRoom}
									/>
									<ListItemText primary={device.naprava} />
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ ml: 2, fontStyle: "italic" }}
									>
										{device.soba ?? "NO ROOM"}
									</Typography>
								</MenuItem>
							);
						})}
					</Select>
				</FormControl>

				<Stack direction="row" spacing={2} justifyContent="flex-end">
					<Button variant="contained" onClick={handleAdd} disabled={loading}>
						ADD TO ROOM
					</Button>
				</Stack>
			</Stack>
		</>
	);
};

export default AddDeviceRoom;
