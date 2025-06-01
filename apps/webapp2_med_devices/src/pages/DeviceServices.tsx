import React, { useState, useEffect } from "react";
import MainLayout from "../layout/MainLayout";
import {
	TableBody,
	Typography,
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	Paper,
	Checkbox,
	Box,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	IconButton,
	Stack,
	TablePagination,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeviceService from "../components/services/DeviceService";
import api from "../api";

const DeviceServices: React.FC = () => {
	const [devices, setDevices] = useState<any[]>([]);
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [openService, setOpenService] = useState(false);

	// Pagination state
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(15);

	const fetchDevices = () => {
		api
			.get("/devices")
			.then((res) => setDevices(res.data.data))
			.catch((err) => console.error("Error fetching devices:", err));
	};
	useEffect(fetchDevices, []);

	const handleSelect = (id: number) => {
		setSelectedId((prev) => (prev === id ? null : id));
	};

	const handleOpenService = () => {
		if (selectedId == null) {
			alert("Please choose one device.");
			return;
		}
		setOpenService(true);
	};
	const handleCloseService = () => {
		setOpenService(false);
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

	// Slice devices for current page
	const paginatedDevices = devices.slice(
		page * rowsPerPage,
		page * rowsPerPage + rowsPerPage
	);

	const device = devices.find((d) => d.idnaprava === selectedId)!;

	return (
		<MainLayout>
			<Typography variant="h4" gutterBottom sx={{ fontWeight: "600" }}>
				DEVICE SERVICES
			</Typography>

			<TableContainer component={Paper}>
				<Table>
					<TableHead sx={{ bgcolor: "#2C2D2D" }}>
						<TableRow>
							<TableCell padding="checkbox" sx={{ color: "white" }} />
							<TableCell sx={{ color: "white" }}>Device Name</TableCell>
							<TableCell sx={{ color: "white" }}>Device Type</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{paginatedDevices.map((d) => (
							<TableRow key={d.idnaprava}>
								<TableCell padding="checkbox">
									<Checkbox
										checked={selectedId === d.idnaprava}
										onChange={() => handleSelect(d.idnaprava)}
									/>
								</TableCell>
								<TableCell>{d.naziv}</TableCell>
								<TableCell>{d.TipNaprave.naziv}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				<TablePagination
					rowsPerPageOptions={[5, 10, 25]}
					component="div"
					count={devices.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
				/>
			</TableContainer>

			<Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
				<Stack direction="row" spacing={2}>
					<Button
						variant="outlined"
						onClick={handleOpenService}
						disabled={selectedId === null}
					>
						SERVICE OVERVIEW
					</Button>
				</Stack>
			</Box>

			{/* Modal for service overview */}
			<Dialog
				open={openService}
				onClose={handleCloseService}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle sx={{ m: 0, p: 2 }}>
					Services overview: <strong>{device?.naziv}</strong>
					<IconButton
						aria-label="close"
						onClick={handleCloseService}
						sx={{ position: "absolute", right: 8, top: 8 }}
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers>
					{device && (
						<DeviceService
							device={device}
							onServiceAdded={() => {
								fetchDevices();
								handleCloseService();
							}}
						/>
					)}
				</DialogContent>
			</Dialog>
		</MainLayout>
	);
};

export default DeviceServices;
