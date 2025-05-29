import React, { useState, useEffect } from "react";
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
	Dialog,
	DialogTitle,
	DialogContent,
	IconButton,
	Stack,
	Collapse,
	TablePagination,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import api from "../api";
import AddRoom from "../components/rooms/AddRoom";
import AddDeviceRoom from "../components/rooms/AddDeviceRoom";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DeviceReportModal from "../components/devices/DeviceReportModal";

interface RoomWithDeviceCount {
	idsoba: number;
	naziv: string;
	lokacija: string;
	st_naprav: string;
	unsaved_changes: boolean;
}

interface Device {
	idnaprava: number;
	naprava: string;
	tip_naprave: string;
	soba_idsoba: number | null;
}

const OperationRooms: React.FC = () => {
	const [rooms, setRooms] = useState<RoomWithDeviceCount[]>([]);
	const [selected, setSelected] = useState<number[]>([]);
	const [openAddRoom, setOpenAddRoom] = useState(false);
	const [openAddDeviceRoom, setOpenAddDeviceRoom] = useState(false);

	const [openRows, setOpenRows] = useState<Record<number, boolean>>({});
	const [allDevices, setAllDevices] = useState<Device[]>([]);
	const [loadingRemoving, setLoadingRemoving] = useState<
		Record<number, boolean>
	>({});

	const [openReportModal, setOpenReportModal] = useState(false);
	const [reportDeviceId, setReportDeviceId] = useState<number | null>(null);

	// Pagination state
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);

	const [loadingCommitIds, setLoadingCommitIds] = useState<number[]>([]);

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

	const fetchDevices = () => {
		api
			.get("/devices/prikaz")
			.then((res) => {
				if (Array.isArray(res.data.data)) {
					setAllDevices(res.data.data);
				} else {
					console.error("Devices response is not array:", res.data);
				}
			})
			.catch(console.error);
	};

	useEffect(() => {
		fetchRooms();
		fetchDevices();
	}, []);

	const toggleAll = () =>
		setSelected((sel) =>
			sel.length === rooms.length ? [] : rooms.map((r) => r.idsoba)
		);

	const toggleOne = (id: number) =>
		setSelected((sel) =>
			sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]
		);

	const toggleRow = (id: number) => {
		setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	const handleRemoveDevice = async (deviceId: number) => {
		setLoadingRemoving((prev) => ({ ...prev, [deviceId]: true }));
		try {
			await api.put(`/devices/${deviceId}`, { soba_idsoba: null });
			await fetchDevices();
			await fetchRooms();
		} catch (error) {
			console.error("Error removing device from room", error);
			alert("Failed to remove device from room.");
		} finally {
			setLoadingRemoving((prev) => ({ ...prev, [deviceId]: false }));
		}
	};

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
		fetchDevices();
		closeAddDeviceRoom();
	};

	const handleCommit = async (roomId: number) => {
		setLoadingCommitIds((prev) => [...prev, roomId]);
		try {
			await api.post("/rooms/commitChanges", { id: roomId });
			await fetchRooms();
		} catch (err) {
			console.error("Error committing changes for room:", err);
			alert("Failed to commit changes.");
		} finally {
			setLoadingCommitIds((prev) => prev.filter((id) => id !== roomId));
		}
	};

	// Pagination handlers
	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	// Paginate rooms for current page
	const paginatedRooms = rooms.slice(
		page * rowsPerPage,
		page * rowsPerPage + rowsPerPage
	);

	const handleShowReport = (deviceId: number) => {
		setReportDeviceId(deviceId);
		setOpenReportModal(true);
	};

	return (
		<MainLayout>
			<Typography variant="h4" gutterBottom sx={{ fontWeight: "600" }}>
				OPERATION ROOMS
			</Typography>

			<TableContainer component={Paper}>
				<Table>
					<TableHead sx={{ bgcolor: "#2C2D2D" }}>
						<TableRow>
							<TableCell padding="checkbox" sx={{ color: "white" }}>
								<Checkbox
									indeterminate={
										selected.length > 0 && selected.length < rooms.length
									}
									checked={rooms.length > 0 && selected.length === rooms.length}
									onChange={toggleAll}
									sx={{ color: "white" }}
								/>
							</TableCell>
							<TableCell sx={{ color: "white" }} />
							<TableCell sx={{ color: "white" }}>Room Name</TableCell>
							<TableCell sx={{ color: "white" }}>Location</TableCell>
							<TableCell align="right" sx={{ color: "white" }}>
								Device Count
							</TableCell>
							<TableCell align="center" sx={{ color: "white" }}>
								Actions
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{paginatedRooms.map((room) => {
							const devicesInRoom = allDevices.filter(
								(dev) => dev.soba_idsoba === room.idsoba
							);

							return (
								<React.Fragment key={room.idsoba}>
									<TableRow
										sx={{
											backgroundColor: room.unsaved_changes
												? "rgba(255, 179, 71, 0.15)"
												: "inherit",
										}}
									>
										<TableCell padding="checkbox">
											<Checkbox
												checked={selected.includes(room.idsoba)}
												onChange={() => toggleOne(room.idsoba)}
											/>
										</TableCell>
										<TableCell padding="none" sx={{ width: 40 }}>
											{devicesInRoom.length > 0 ? (
												<IconButton
													aria-label="expand row"
													size="small"
													onClick={() => toggleRow(room.idsoba)}
												>
													{openRows[room.idsoba] ? (
														<KeyboardArrowUpIcon />
													) : (
														<KeyboardArrowDownIcon />
													)}
												</IconButton>
											) : null}
										</TableCell>
										<TableCell>{room.naziv}</TableCell>
										<TableCell>{room.lokacija}</TableCell>
										<TableCell align="right">{room.st_naprav}</TableCell>
										<TableCell align="center">
											{room.unsaved_changes &&
												(loadingCommitIds.includes(room.idsoba) ? (
													<Button
														variant="contained"
														color="warning"
														size="small"
														disabled
														loading
													>
														Commit
													</Button>
												) : (
													<Button
														variant="contained"
														color="warning"
														size="small"
														onClick={() => handleCommit(room.idsoba)}
													>
														Commit
													</Button>
												))}
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell
											style={{ paddingBottom: 0, paddingTop: 0 }}
											colSpan={6}
										>
											<Collapse
												in={!!openRows[room.idsoba] && devicesInRoom.length > 0}
												timeout="auto"
												unmountOnExit
											>
												<Box sx={{ margin: 1 }}>
													<Table
														size="small"
														aria-label="devices-in-room"
														stickyHeader
													>
														<TableHead>
															<TableRow>
																<TableCell>
																	<strong>Device Name</strong>
																</TableCell>
																<TableCell>
																	<strong>Device Type</strong>
																</TableCell>
																<TableCell align="right">
																	<strong>Actions</strong>
																</TableCell>
															</TableRow>
														</TableHead>
														<TableBody>
															{devicesInRoom.map((device, index) => (
																<TableRow
																	key={device.idnaprava}
																	sx={{
																		backgroundColor:
																			index % 2 === 0 ? "white" : "#f5f5f5",
																	}}
																>
																	<TableCell component="th" scope="row">
																		{device.naprava}
																	</TableCell>
																	<TableCell>{device.tip_naprave}</TableCell>
																	<TableCell
																		align="right"
																		sx={{
																			display: "flex",
																			gap: 2,
																		}}
																	>
																		<Button
																			size="small"
																			variant="outlined"
																			color="error"
																			onClick={() =>
																				handleRemoveDevice(device.idnaprava)
																			}
																			disabled={
																				!!loadingRemoving[device.idnaprava]
																			}
																		>
																			{loadingRemoving[device.idnaprava]
																				? "Removing..."
																				: "Remove"}
																		</Button>
																		<Button
																			variant="outlined"
																			size="small"
																			startIcon={<PictureAsPdfIcon />}
																			onClick={() =>
																				handleShowReport(device.idnaprava)
																			}
																		>
																			PDF
																		</Button>
																	</TableCell>
																</TableRow>
															))}
														</TableBody>
													</Table>
												</Box>
											</Collapse>
										</TableCell>
									</TableRow>
								</React.Fragment>
							);
						})}
					</TableBody>
				</Table>
				<TablePagination
					rowsPerPageOptions={[5, 10, 25]}
					component="div"
					count={rooms.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
				/>
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

			{/* Modal windows */}
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

			<DeviceReportModal
				open={openReportModal}
				onClose={() => setOpenReportModal(false)}
				deviceId={reportDeviceId}
			/>
		</MainLayout>
	);
};

export default OperationRooms;
