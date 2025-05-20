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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState, useEffect } from "react";
import api from "../api";
import AddDevice from "../components/devices/AddDevice";
import EditDevice from "../components/devices/EditDevice";

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

	// Pridobi vse naprave za filtriranje
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
				console.error(
					"Napaka pri pridobivanju podatkov o tipih naprav:",
					error
				);
			});
	}, []);

	const toggleAll = () =>
		setSelected((sel) =>
			sel.length === devices.length ? [] : devices.map((d) => d.idnaprava)
		);
	const toggleOne = (id: number) =>
		setSelected((sel) =>
			sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]
		);

	const handleDelete = () => {
		if (!selected.length) return alert("Izberi vsaj eno napravo.");
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
			return alert("Izberi natanko eno napravo za urejanje.");
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
				console.error("Napaka pri pridobivanju naprave:", err);
				alert("Napaka pri nalaganju podatkov za urejanje.");
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

	return (
		<MainLayout>
			<Typography variant="h4" gutterBottom>
				Pregled vseh naprav
			</Typography>

			{/* Filtriranje */}
			<Box mb={2} display="flex" gap={2} alignItems="center">
				<FormControl size="small">
					<InputLabel>Tip naprave</InputLabel>
					<Select
						value={filterType}
						label="Tip naprave"
						onChange={(e: SelectChangeEvent) => setFilterType(e.target.value)}
					>
						<MenuItem value="all">Vsi tipi</MenuItem>
						{tipiNaprave.map((tip) => (
							<MenuItem key={tip.idtip_naprave} value={tip.naziv}>
								{tip.naziv}
							</MenuItem>
						))}
					</Select>
				</FormControl>

				<FormControl size="small">
					<InputLabel>Servis</InputLabel>
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
						<MenuItem value="all">Vsi</MenuItem>
						<MenuItem value="yes">✓</MenuItem>
						<MenuItem value="no">X</MenuItem>
					</Select>
				</FormControl>
			</Box>

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell padding="checkbox">
								<Checkbox
									indeterminate={
										selected.length > 0 && selected.length < devices.length
									}
									checked={
										devices.length > 0 && selected.length === devices.length
									}
									onChange={toggleAll}
								/>
							</TableCell>
							<TableCell>Ime naprave</TableCell>
							<TableCell>Tip naprave</TableCell>
							<TableCell>Stanje</TableCell>
							<TableCell>Soba</TableCell>
							<TableCell>Servis</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{devices.map((d) => (
							<TableRow key={d.idnaprava}>
								<TableCell padding="checkbox">
									<Checkbox
										checked={selected.includes(d.idnaprava)}
										onChange={() => toggleOne(d.idnaprava)}
									/>
								</TableCell>
								<TableCell>{d.naprava}</TableCell>
								<TableCell>{d.tip_naprave}</TableCell>
								<TableCell>Aktivno</TableCell>
								<TableCell>
									{d.soba === "BREZ SOBE" ? (
										<Typography
											component="span"
											sx={{ fontWeight: "bold", color: "red" }}
										>
											{d.soba}
										</Typography>
									) : (
										d.soba
									)}
								</TableCell>
								<TableCell>{d.servis ? "✓" : "X"}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
				<Stack direction="row" spacing={2}>
					<Button variant="outlined" onClick={openEdit}>
						Uredi napravo
					</Button>
					<Button variant="outlined" onClick={openAdd}>
						Dodaj napravo
					</Button>
					<Button variant="outlined" color="error" onClick={handleDelete}>
						Odstrani napravo
					</Button>
				</Stack>
			</Box>

			{/* Modal */}
			<Dialog open={openModal} onClose={closeModal} fullWidth maxWidth="sm">
				<DialogTitle sx={{ m: 0, p: 2 }}>
					{editingDevice
						? `Uredi napravo: ${editingDevice.naziv}`
						: "Dodaj novo napravo"}
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
		</MainLayout>
	);
};

export default Devices;
