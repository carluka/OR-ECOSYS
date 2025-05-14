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
	Stack,
	Dialog,
	DialogTitle,
	DialogContent,
	IconButton,
} from "@mui/material";
import { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import AddDevice from "../components/devices/AddDevice";
import EditDevice from "../components/devices/EditDevice";
import api from "../api";

const PregledVsehNaprav: React.FC = () => {
	const [open, setOpen] = useState(false);
	const [formKey, setFormKey] = useState(0);
	const [naprave, setNaprave] = useState<any[]>([]);
	const [selectedDevices, setSelectedDevices] = useState<number[]>([]);
	const [deviceToEdit, setDeviceToEdit] = useState<any | null>(null);

	// Pridobivanje naprav

	const fetchDevices = () => {
		api
			.get("/devices")
			.then((response) => {
				setNaprave(response.data.data);
			})
			.catch((error) => {
				console.error("Error fetching device data:", error);
			});
	};

	useEffect(() => {
		fetchDevices(); // Fetchanje naprav
	}, []);

	const handleOpen = () => {
		setFormKey((prev) => prev + 1);
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
		setDeviceToEdit(null);
	};

	const handleCheckboxChange = (id: number) => {
		setSelectedDevices((prevSelectedDevices) => {
			if (prevSelectedDevices.includes(id)) {
				return prevSelectedDevices.filter((deviceId) => deviceId !== id);
			} else {
				return [...prevSelectedDevices, id];
			}
		});
	};

	// Izbriši izbrane naprave

	const handleDeleteDevices = () => {
		if (selectedDevices.length === 0) {
			console.log("No devices selected for deletion.");
			return;
		}
		api
			.delete("/devices/deleteMultiple", { data: { ids: selectedDevices } })
			.then((response) => {
				setNaprave((prevNaprave) =>
					prevNaprave.filter(
						(naprava) => !selectedDevices.includes(naprava.idnaprava)
					)
				);
				setSelectedDevices([]);
			})
			.catch((error) => {
				console.error("Failed to delete devices:", error);
			});
	};

	// Odpre modalno okno za urejanje naprave

	const handleEditDevice = () => {
		if (selectedDevices.length !== 1) {
			alert("Prosim izberi natanko eno napravo za urejanje.");
			return;
		}
		const selectedDevice = naprave.find(
			(device) => device.idnaprava === selectedDevices[0]
		);
		if (selectedDevice) {
			setDeviceToEdit(selectedDevice);
			setOpen(true);
		}
	};

	return (
		<MainLayout>
			<Typography variant="h4" gutterBottom>
				PREGLED VSEH NAPRAV
			</Typography>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell padding="checkbox">
								<Checkbox
									checked={naprave.length === selectedDevices.length}
									onChange={() =>
										setSelectedDevices(
											selectedDevices.length === naprave.length
												? []
												: naprave.map((n) => n.idnaprava)
										)
									}
								/>
							</TableCell>
							<TableCell>Ime</TableCell>
							<TableCell>Tip</TableCell>
							<TableCell>Stanje</TableCell>
							<TableCell>Lokacija</TableCell>
							<TableCell>Servisiran</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{naprave.map((naprava, index) => (
							<TableRow key={index}>
								<TableCell padding="checkbox">
									<Checkbox
										checked={selectedDevices.includes(naprava.idnaprava)}
										onChange={() => handleCheckboxChange(naprava.idnaprava)}
									/>
								</TableCell>
								<TableCell>{naprava.naziv}</TableCell>
								<TableCell>{naprava.TipNaprave.naziv}</TableCell>
								<TableCell>{naprava.stanje}</TableCell>
								<TableCell>
									{naprava.Soba.naziv} {naprava.Soba.lokacija}
								</TableCell>
								<TableCell>✓</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
				<Stack direction="row" spacing={3}>
					<Button variant="outlined" onClick={handleEditDevice}>
						Uredi napravo
					</Button>
					<Button variant="outlined" onClick={handleOpen}>
						Dodaj napravo
					</Button>
					<Button
						variant="outlined"
						color="error"
						onClick={handleDeleteDevices}
					>
						Odstrani napravo
					</Button>
				</Stack>
			</Box>

			{/* Modal za urejanje ali dodajanje naprave */}
			<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
				<DialogTitle sx={{ m: 0, p: 2 }}>
					{deviceToEdit
						? `Uredi napravo: ${deviceToEdit.naziv}`
						: "Dodaj novo napravo"}
					<IconButton
						aria-label="close"
						onClick={handleClose}
						sx={{ position: "absolute", right: 8, top: 8 }}
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers>
					{deviceToEdit ? (
						<EditDevice device={deviceToEdit} onDeviceUpdated={fetchDevices} />
					) : (
						<AddDevice onDeviceAdded={fetchDevices} />
					)}
				</DialogContent>
			</Dialog>
		</MainLayout>
	);
};

export default PregledVsehNaprav;
