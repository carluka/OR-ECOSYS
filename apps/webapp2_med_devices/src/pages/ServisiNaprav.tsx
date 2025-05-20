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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeviceService from "../components/services/DeviceService";
import api from "../api";

const ServisiNaprav: React.FC = () => {
	const [devices, setDevices] = useState<any[]>([]);
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [openService, setOpenService] = useState(false);

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
			alert("Prosim izberi eno napravo za servis.");
			return;
		}
		setOpenService(true);
	};
	const handleCloseService = () => {
		setOpenService(false);
	};

	const device = devices.find((d) => d.idnaprava === selectedId)!;

	return (
		<MainLayout>
			<Typography variant="h4" gutterBottom>
				Servisi naprav
			</Typography>

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell padding="checkbox" />
							<TableCell>Ime naprave</TableCell>
							<TableCell>Tip naprave</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{devices.map((d) => (
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
			</TableContainer>

			<Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
				<Stack direction="row" spacing={2}>
					<Button variant="outlined" onClick={handleOpenService}>
						Pregled servisov
					</Button>
				</Stack>
			</Box>

			{/* Modal za pregled servisov */}
			<Dialog
				open={openService}
				onClose={handleCloseService}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle sx={{ m: 0, p: 2 }}>
					Pregled servisov naprave: {device?.naziv}
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

export default ServisiNaprav;
