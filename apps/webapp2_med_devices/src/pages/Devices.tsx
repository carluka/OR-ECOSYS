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
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	SelectChangeEvent,
	TablePagination,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CloseIcon from "@mui/icons-material/Close";
import { useState, useEffect } from "react";
import api from "../api";
import AddDevice from "../components/devices/AddDevice";
import EditDevice from "../components/devices/EditDevice";
import DeviceReportModal from "../components/devices/DeviceReportModal";

interface DeviceOverview {
	idnaprava: number;
	naprava: string;
	tip_naprave: string;
	soba: string;
	servis: boolean;
}

interface FullDevice {
	idnaprava: number;
	naziv: string;
	tip_naprave_idtip_naprave: number;
	soba_idsoba: number;
	stanje: string;
	servisiran: boolean;
}

const Devices: React.FC = () => {
	const [devices, setDevices] = useState<DeviceOverview[]>([]);
	const [selected, setSelected] = useState<number[]>([]);
	const [openModal, setOpenModal] = useState(false);
	const [formKey, setFormKey] = useState(0);
	const [editingDevice, setEditingDevice] = useState<FullDevice | null>(null);

	const [filterType, setFilterType] = useState<string>("all");
	const [filterServis, setFilterServis] = useState<"all" | "yes" | "no">("all");
	const [tipiNaprave, setTipiNaprave] = useState<
		{ idtip_naprave: number; naziv: string }[]
	>([]);

	const [openReportModal, setOpenReportModal] = useState(false);
	const [reportDeviceId, setReportDeviceId] = useState<number | null>(null);

	// Pagination state
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);

	const fetchDevices = () => {
		const params: Record<string, any> = {};
		if (filterType !== "all") params.tip_naprave = filterType;
		if (filterServis !== "all") params.servis = filterServis === "yes";
		api
			.get("/devices/prikaz", { params })
			.then((res) => setDevices(res.data.data))
			.catch(console.error);
	};
	useEffect(() => {
		fetchDevices();
	}, [filterType, filterServis]);

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
	}, []);

	// Selection handlers
	const toggleAll = () =>
		setSelected((sel) =>
			sel.length === devices.length ? [] : devices.map((d) => d.idnaprava)
		);
	const toggleOne = (id: number) =>
		setSelected((sel) =>
			sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]
		);

	const handleDelete = () => {
		if (!selected.length) return alert("Choose at least one device.");
		api
			.delete("/devices/deleteMultiple", { data: { ids: selected } })
			.then(() => {
				setSelected([]);
				fetchDevices();
			})
			.catch(console.error);
	};

	const openAdd = () => {
		setEditingDevice(null);
		setFormKey((k) => k + 1);
		setOpenModal(true);
	};

	const openEdit = () => {
		if (selected.length !== 1) {
			return alert("Choose exactly one device.");
		}
		const id = selected[0];
		api
			.get<{ data: FullDevice }>(`/devices/${id}`)
			.then((res) => {
				setEditingDevice(res.data.data);
				setFormKey((k) => k + 1);
				setOpenModal(true);
			})
			.catch((err) => {
				console.error("Error fetching devices:", err);
				alert("Error loading data for devices.");
			});
	};

	const closeModal = () => {
		setOpenModal(false);
		setEditingDevice(null);
	};

	const handleSaved = () => {
		fetchDevices();
		setSelected([]);
		closeModal();
	};

	// PDF MODAL
	const handleShowReport = (deviceId: number) => {
		setReportDeviceId(deviceId);
		setOpenReportModal(true);
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

	return (
		<MainLayout>
			<Typography variant="h4" gutterBottom sx={{ fontWeight: "600" }}>
				DEVICES
			</Typography>

			{/* Filters */}
			<Box mb={2} display="flex" gap={2} alignItems="center">
				<FormControl size="small">
					<InputLabel>Device type</InputLabel>
					<Select
						value={filterType}
						label="Tip naprave"
						onChange={(e: SelectChangeEvent) => setFilterType(e.target.value)}
					>
						<MenuItem value="all">All devices</MenuItem>
						{tipiNaprave.map((tip) => (
							<MenuItem key={tip.idtip_naprave} value={tip.naziv}>
								{tip.naziv}
							</MenuItem>
						))}
					</Select>
				</FormControl>

				<FormControl size="small">
					<InputLabel>Service</InputLabel>
					<Select
						value={filterServis}
						label="Servis"
						onChange={(e) => setFilterServis(e.target.value as any)}
						sx={{
							"& .MuiSelect-select": {
								textAlign: "center",
							},
						}}
						MenuProps={{
							PaperProps: {
								sx: {
									"& .MuiMenuItem-root": {
										justifyContent: "center",
									},
								},
							},
						}}
					>
						<MenuItem value="all">All</MenuItem>
						<MenuItem value="yes">✓</MenuItem>
						<MenuItem value="no">X</MenuItem>
					</Select>
				</FormControl>
			</Box>

			<TableContainer component={Paper}>
				<Table>
					<TableHead sx={{ bgcolor: "#2C2D2D" }}>
						<TableRow>
							<TableCell padding="checkbox" sx={{ color: "white" }}>
								<Checkbox
									indeterminate={
										selected.length > 0 && selected.length < devices.length
									}
									checked={
										devices.length > 0 && selected.length === devices.length
									}
									onChange={toggleAll}
									sx={{ color: "white" }}
								/>
							</TableCell>
							<TableCell sx={{ color: "white" }}>Device Name</TableCell>
							<TableCell sx={{ color: "white" }}>Device Type</TableCell>
							<TableCell sx={{ color: "white" }}>State</TableCell>
							<TableCell sx={{ color: "white" }}>Room</TableCell>
							<TableCell align="center" sx={{ color: "white" }}>
								Service
							</TableCell>
							<TableCell align="center" sx={{ color: "white" }}>
								Actions
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{paginatedDevices.map((d) => (
							<TableRow key={d.idnaprava}>
								<TableCell padding="checkbox">
									<Checkbox
										checked={selected.includes(d.idnaprava)}
										onChange={() => toggleOne(d.idnaprava)}
									/>
								</TableCell>
								<TableCell>{d.naprava}</TableCell>
								<TableCell>{d.tip_naprave}</TableCell>
								<TableCell>Active</TableCell>
								<TableCell
									align={d.soba === "NO ROOM" ? "center" : "inherit"}
									sx={{
										color: d.soba === "NO ROOM" ? "#E45F61" : "inherit",
										fontWeight: d.soba === "NO ROOM" ? "bold" : "inherit",
									}}
								>
									{d.soba === "NO ROOM" ? d.soba : d.soba}
								</TableCell>

								<TableCell align="center">{d.servis ? "✓" : "X"}</TableCell>
								<TableCell align="center">
									<Button
										variant="outlined"
										size="small"
										startIcon={<PictureAsPdfIcon />}
										onClick={() => handleShowReport(d.idnaprava)}
									>
										PDF
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<TablePagination
				component="div"
				count={devices.length}
				page={page}
				onPageChange={handleChangePage}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={handleChangeRowsPerPage}
				rowsPerPageOptions={[5, 10, 25]}
			/>

			<Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
				<Stack direction="row" spacing={2}>
					<Button variant="outlined" onClick={openAdd}>
						ADD DEVICE
					</Button>
					<Button
						variant="outlined"
						onClick={openEdit}
						disabled={selected.length !== 1}
					>
						EDIT DEVICE
					</Button>
					<Button
						variant="outlined"
						color="error"
						onClick={handleDelete}
						disabled={selected.length < 1}
					>
						REMOVE DEVICE
					</Button>
				</Stack>
			</Box>

			<Dialog open={openModal} onClose={closeModal} fullWidth maxWidth="sm">
				<DialogTitle sx={{ m: 0, p: 2 }}>
					{editingDevice
						? `Edit device: ${editingDevice.naziv}`
						: "Add new device"}
					<IconButton
						aria-label="close"
						onClick={closeModal}
						sx={{ position: "absolute", right: 8, top: 8 }}
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers>
					{editingDevice ? (
						<EditDevice
							key={formKey}
							device={editingDevice}
							onDeviceUpdated={handleSaved}
						/>
					) : (
						<AddDevice key={formKey} onDeviceAdded={handleSaved} />
					)}
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

export default Devices;
