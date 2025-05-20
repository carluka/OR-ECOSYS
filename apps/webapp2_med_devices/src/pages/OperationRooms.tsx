import MainLayout from "../layout/MainLayout";
import {
	Typography,
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Paper,
	Checkbox,
	Box,
	Button,
	Stack,
	Dialog,
	DialogTitle,
	DialogContent,
	IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState, useEffect } from "react";
import api from "../api";
import AddRoom from "../components/rooms/AddRoom";
import AddDeviceRoom from "../components/rooms/AddDeviceRoom";

interface RoomWithDeviceCount {
	idsoba: number;
	naziv: string;
	lokacija: string;
	st_naprav: string;
}

const OperationRooms: React.FC = () => {
	const [rooms, setRooms] = useState<RoomWithDeviceCount[]>([]);
	const [selected, setSelected] = useState<number[]>([]);

	const [openAddRoom, setOpenAddRoom] = useState(false);
	const [openAddDeviceRoom, setOpenAddDeviceRoom] = useState(false);

	const fetchRooms = () => {
		api
			.get("/rooms/roomsDeviceCount")
			.then((res) => {
				if (Array.isArray(res.data.data)) {
					setRooms(res.data.data);
				} else {
					console.error("API response data is not an array:", res.data);
				}
			})
			.catch(console.error);
	};

	useEffect(() => {
		fetchRooms();
	}, []);

	const toggleAll = () =>
		setSelected((sel) =>
			sel.length === rooms.length ? [] : rooms.map((r) => r.idsoba)
		);

	const toggleOne = (id: number) =>
		setSelected((sel) =>
			sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]
		);

	const handleDelete = () => {
		if (!selected.length) return alert("Choose at least one room.");
		api
			.delete("/rooms/deleteMultiple", { data: { ids: selected } })
			.then(() => {
				setSelected([]);
				fetchRooms();
			})
			.catch((err) => {
				console.error("Error deleting rooms:", err);
				alert("Error deleting rooms.");
			});
	};

	const openAddDevice = () => {
		if (selected.length !== 1) {
			alert("Choose exactly one room.");
			return;
		}
		setOpenAddDeviceRoom(true);
	};

	const closeAddRoom = () => setOpenAddRoom(false);
	const closeAddDeviceRoom = () => setOpenAddDeviceRoom(false);

	const onRoomAdded = () => {
		fetchRooms();
		closeAddRoom();
	};

	const onDeviceAdded = () => {
		fetchRooms();
		closeAddDeviceRoom();
	};

	return (
		<MainLayout>
			<Typography variant="h4" gutterBottom>
				OPERATION ROOMS
			</Typography>

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell padding="checkbox">
								<Checkbox
									indeterminate={
										selected.length > 0 && selected.length < rooms.length
									}
									checked={rooms.length > 0 && selected.length === rooms.length}
									onChange={toggleAll}
								/>
							</TableCell>
							<TableCell>Room Name</TableCell>
							<TableCell>Location</TableCell>
							<TableCell align="right">Device Count</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{rooms.map((room) => (
							<TableRow key={room.idsoba}>
								<TableCell padding="checkbox">
									<Checkbox
										checked={selected.includes(room.idsoba)}
										onChange={() => toggleOne(room.idsoba)}
									/>
								</TableCell>
								<TableCell>{room.naziv}</TableCell>
								<TableCell>{room.lokacija}</TableCell>
								<TableCell align="right">{room.st_naprav}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
				<Stack direction="row" spacing={2}>
					<Button variant="outlined" onClick={() => setOpenAddRoom(true)}>
						Add room
					</Button>
					<Button
						variant="outlined"
						onClick={openAddDevice}
						disabled={selected.length !== 1}
					>
						Add devices to room
					</Button>
					<Button
						variant="outlined"
						color="error"
						onClick={handleDelete}
						disabled={selected.length === 0}
					>
						Delete room
					</Button>
				</Stack>
			</Box>

			{/* Modal */}
			<Dialog open={openAddRoom} onClose={closeAddRoom} fullWidth maxWidth="sm">
				<DialogTitle sx={{ m: 0, p: 2 }}>
					Create new room
					<IconButton
						aria-label="close"
						onClick={closeAddRoom}
						sx={{ position: "absolute", right: 8, top: 8 }}
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers>
					<AddRoom onClose={closeAddRoom} onAdded={onRoomAdded} />
				</DialogContent>
			</Dialog>

			<Dialog
				open={openAddDeviceRoom}
				onClose={closeAddDeviceRoom}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle sx={{ m: 0, p: 2 }}>
					Add devices to room
					<IconButton
						aria-label="close"
						onClick={closeAddDeviceRoom}
						sx={{ position: "absolute", right: 8, top: 8 }}
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers>
					<AddDeviceRoom
						roomId={selected[0]}
						onClose={closeAddDeviceRoom}
						onAdded={onDeviceAdded}
					/>
				</DialogContent>
			</Dialog>
		</MainLayout>
	);
};

export default OperationRooms;
