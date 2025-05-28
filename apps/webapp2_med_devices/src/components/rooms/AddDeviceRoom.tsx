import React, { useEffect, useState } from "react";
import {
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
	Box,
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
	tip_naprave: string;
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

	// Main filter:
	const deviceTypesInRoom = new Set(
		devices.filter((d) => d.soba_idsoba === roomId).map((d) => d.tip_naprave)
	);
	const filteredDevices = devices
		.filter((d) => d.soba_idsoba !== roomId)
		.filter((d) => !deviceTypesInRoom.has(d.tip_naprave));

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
							filteredDevices
								.filter((d) => selected.includes(d.idnaprava))
								.map((d) => d.naprava)
								.join(", ")
						}
					>
						<MenuItem disabled sx={{ opacity: 1, fontWeight: 600 }}>
							<Box sx={{ width: 58 }} />
							<Box sx={{ flex: 2, minWidth: 120, mr: 2 }}>Device Name</Box>
							<Box sx={{ flex: 2, minWidth: 160, mr: 2 }}>Device Type</Box>
							<Box sx={{ flex: 2, minWidth: 100 }}>Room Name</Box>
						</MenuItem>
						{filteredDevices.length === 0 ? (
							<MenuItem disabled>
								No available devices of new types for this room
							</MenuItem>
						) : (
							filteredDevices.map((device) => (
								<MenuItem
									key={device.idnaprava}
									value={device.idnaprava}
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 2,
										minHeight: 48,
									}}
								>
									<Checkbox
										checked={selectedDevices.includes(device.idnaprava)}
									/>
									<Box sx={{ flex: 2, minWidth: 120, mr: 2 }}>
										<ListItemText primary={device.naprava} />
									</Box>
									<Typography
										sx={{
											flex: 2,
											minWidth: 160,
											mr: 2,
											wordBreak: "break-word",
											whiteSpace: "normal",
											fontWeight: 500,
										}}
									>
										{device.tip_naprave}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{
											flex: 2,
											minWidth: 100,
											fontStyle: "italic",
											wordBreak: "break-word",
											whiteSpace: "normal",
										}}
									>
										{device.soba ?? "NO ROOM"}
									</Typography>
								</MenuItem>
							))
						)}
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
