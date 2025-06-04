import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Typography,
	Box,
	Chip,
	Card,
	CardContent,
	TextField,
	InputAdornment,
	IconButton,
	Tooltip,
	Alert,
	CircularProgress,
	Badge,
	Menu,
	MenuItem,
	ListItemIcon,
} from "@mui/material";
import {
	LocalHospital,
	Search,
	FilterList,
	Visibility,
	MoreVert,
	MeetingRoom,
	LocationOn,
	CheckCircle,
	AccessTime,
} from "@mui/icons-material";
import api from "../../api";

interface Room {
	idsoba: number;
	naziv: string;
	lokacija: string;
	active?: boolean;
	equipment?: string[];
	capacity?: number;
}

interface ApiResponse {
	data: Room[];
}

const OperationRoomsPage = () => {
	const [rooms, setRooms] = useState<Room[]>([]);
	const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchRooms = async () => {
			try {
				setLoading(true);
				setError(null);

				const response = await api.get<ApiResponse>("/rooms");
				const baseRooms: Room[] = response.data.data;

				const roomsWithStatus: Room[] = await Promise.all(
					baseRooms.map(async (room) => {
						try {
							const statusRes = await api.get<{ active: boolean }>(
								`/rooms/${room.idsoba}/status`
							);

							return {
								...room,
								active: statusRes.data.active,
							};
						} catch (statusError) {
							console.error(
								`Error fetching status for room ${room.idsoba}:`,
								statusError
							);
							return {
								...room,
								active: undefined,
							};
						}
					})
				);

				setRooms(roomsWithStatus);
				setFilteredRooms(roomsWithStatus);
			} catch (error) {
				console.error("Error fetching rooms:", error);
				setError("Napaka pri nalaganju podatkov o operacijskih sobah");
			} finally {
				setLoading(false);
			}
		};

		fetchRooms();
	}, []);

	useEffect(() => {
		const filtered = rooms.filter(
			(room) =>
				room.naziv.toLowerCase().includes(searchTerm.toLowerCase()) ||
				room.lokacija.toLowerCase().includes(searchTerm.toLowerCase()) ||
				room.idsoba.toString().includes(searchTerm)
		);
		setFilteredRooms(filtered);
	}, [searchTerm, rooms]);

	const handleRoomSelect = (roomId: number) => {
		navigate(`/operation/${roomId}`);
	};

	const handleMenuOpen = (
		event: React.MouseEvent<HTMLElement>,
		roomId: number
	) => {
		event.stopPropagation();
		setMenuAnchorEl(event.currentTarget);
		setSelectedRoomId(roomId);
	};

	const handleMenuClose = () => {
		setMenuAnchorEl(null);
		setSelectedRoomId(null);
	};

	const handleViewRoom = () => {
		if (selectedRoomId) {
			navigate(`/operation/${selectedRoomId}`);
		}
		handleMenuClose();
	};

	const getRoomStatusChip = (isActive?: boolean) => {
		if (isActive === true) {
			return (
				<Chip
					icon={<CheckCircle />}
					label="Active"
					color="success"
					size="small"
					variant="outlined"
				/>
			);
		} else if (isActive === false) {
			return (
				<Chip
					icon={<AccessTime />}
					label="Not Active"
					color="warning"
					size="small"
					variant="outlined"
				/>
			);
		} else {
			return <Chip label="Unknown" size="small" variant="outlined" />;
		}
	};

	if (loading) {
		return (
			<Box
				sx={{
					p: 3,
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "400px",
				}}
			>
				<CircularProgress />
				<Typography sx={{ ml: 2 }}>Downloading operation rooms...</Typography>
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ p: 3 }}>
				<Alert severity="error">{error}</Alert>
			</Box>
		);
	}

	return (
		<Box sx={{ p: 3 }}>
			<Box sx={{ mb: 4 }}>
				<Typography
					variant="h4"
					gutterBottom
					sx={{ display: "flex", alignItems: "center" }}
				>
					<LocalHospital sx={{ mr: 1 }} color="primary" />
					Operation Rooms
				</Typography>
				<Typography variant="body1" color="text.secondary">
					View and manage all operation rooms and their status
				</Typography>
			</Box>

			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
					gap: 2,
					mb: 3,
				}}
			>
				<Card variant="outlined">
					<CardContent sx={{ textAlign: "center", py: 2 }}>
						<Typography variant="h4" color="primary.main" fontWeight="bold">
							{rooms.length}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Total Rooms
						</Typography>
					</CardContent>
				</Card>
				<Card variant="outlined">
					<CardContent sx={{ textAlign: "center", py: 2 }}>
						<Typography variant="h4" color="success.main" fontWeight="bold">
							{rooms.filter((room) => room.active === true).length}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Active
						</Typography>
					</CardContent>
				</Card>
				<Card variant="outlined">
					<CardContent sx={{ textAlign: "center", py: 2 }}>
						<Typography variant="h4" color="warning.main" fontWeight="bold">
							{rooms.filter((room) => room.active === false).length}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Not Active
						</Typography>
					</CardContent>
				</Card>
			</Box>

			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					mb: 3,
					flexWrap: "wrap",
					gap: 2,
				}}
			>
				<Paper
					sx={{
						p: 1,
						display: "flex",
						alignItems: "center",
						flexGrow: 1,
						maxWidth: "500px",
					}}
				>
					<TextField
						placeholder="Search rooms..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<Search />
								</InputAdornment>
							),
						}}
						sx={{ flexGrow: 1 }}
						size="small"
						variant="standard"
					/>
					<Tooltip title="Advanced Filters">
						<IconButton>
							<FilterList />
						</IconButton>
					</Tooltip>
				</Paper>
			</Box>

			<Paper sx={{ overflow: "hidden" }}>
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow sx={{ bgcolor: "grey.50" }}>
								<TableCell sx={{ fontWeight: 600 }}>Room ID</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>Room Name</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{filteredRooms.length > 0 ? (
								filteredRooms.map((room) => (
									<TableRow
										key={room.idsoba}
										onClick={() => handleRoomSelect(room.idsoba)}
										sx={{
											cursor: "pointer",
											"&:hover": {
												backgroundColor: "action.hover",
											},
											transition: "background-color 0.2s",
										}}
									>
										<TableCell>
											<Chip
												label={`#${room.idsoba}`}
												size="small"
												variant="outlined"
												color="primary"
											/>
										</TableCell>
										<TableCell>
											<Box
												sx={{ display: "flex", alignItems: "center", gap: 1 }}
											>
												<Badge
													color={room.active ? "success" : "warning"}
													variant="dot"
													anchorOrigin={{ vertical: "top", horizontal: "left" }}
													sx={{ "& .MuiBadge-badge": { top: 13, left: 13 } }}
												>
													<MeetingRoom color="action" />
												</Badge>
												<Typography variant="body2" fontWeight="medium">
													{room.naziv}
												</Typography>
											</Box>
										</TableCell>
										<TableCell>
											<Box
												sx={{ display: "flex", alignItems: "center", gap: 1 }}
											>
												<LocationOn fontSize="small" color="action" />
												<Typography variant="body2">{room.lokacija}</Typography>
											</Box>
										</TableCell>
										<TableCell>{getRoomStatusChip(room.active)}</TableCell>
										<TableCell>
											<Box sx={{ display: "flex", gap: 1 }}>
												<Tooltip title="View Room">
													<IconButton
														size="small"
														color="primary"
														onClick={(e) => {
															e.stopPropagation();
															handleRoomSelect(room.idsoba);
														}}
													>
														<Visibility fontSize="small" />
													</IconButton>
												</Tooltip>
												<Tooltip title="More Options">
													<IconButton
														size="small"
														onClick={(e) => handleMenuOpen(e, room.idsoba)}
														aria-label="more options"
													>
														<MoreVert fontSize="small" />
													</IconButton>
												</Tooltip>
											</Box>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={5} sx={{ textAlign: "center", py: 4 }}>
										<Typography variant="body1" color="text.secondary">
											{searchTerm
												? "No rooms found matching your search."
												: "No operation rooms available."}
										</Typography>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>

			{filteredRooms.length > 0 && (
				<Box
					sx={{
						mt: 2,
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<Typography variant="body2" color="text.secondary">
						Showing {filteredRooms.length} of {rooms.length} operation rooms
					</Typography>
				</Box>
			)}

			<Menu
				anchorEl={menuAnchorEl}
				open={Boolean(menuAnchorEl)}
				onClose={handleMenuClose}
			>
				<MenuItem onClick={handleViewRoom}>
					<ListItemIcon>
						<Visibility fontSize="small" />
					</ListItemIcon>
					View Room
				</MenuItem>
			</Menu>
		</Box>
	);
};

export default OperationRoomsPage;
