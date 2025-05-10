import React, { useState } from "react";
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
import CloseIcon from "@mui/icons-material/Close";
import { zaposleniData } from "../data/zaposleni";
import AddUser from "../components/AddUser"; // Update path if needed

const UpravljanjeZOsebjem: React.FC = () => {
	const [open, setOpen] = useState(false);
	const [formKey, setFormKey] = useState(0);

	const handleOpen = () => {
		setFormKey((prev) => prev + 1); // Force form reset
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<MainLayout>
			<Typography variant="h4" gutterBottom>
				UPRAVLJANJE Z OSEBJEM
			</Typography>

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell padding="checkbox"></TableCell>
							<TableCell>Ime</TableCell>
							<TableCell>Priimek</TableCell>
							<TableCell>Email</TableCell>
							<TableCell>Tip zaposlenega</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{zaposleniData.map((zaposleni, index) => (
							<TableRow key={index}>
								<TableCell padding="checkbox">
									<Checkbox />
								</TableCell>
								<TableCell>{zaposleni.ime}</TableCell>
								<TableCell>{zaposleni.priimek}</TableCell>
								<TableCell>{zaposleni.email}</TableCell>
								<TableCell>{zaposleni.tip_zaposlenega}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Buttons */}
			<Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
				<Stack direction="row" spacing={3}>
					<Button variant="outlined">Uredi uporabnika</Button>
					<Button variant="outlined" onClick={handleOpen}>
						Dodaj uporabnika
					</Button>
					<Button variant="outlined" color="error">
						Odstrani uporabnika
					</Button>
				</Stack>
			</Box>

			{/* Add User Modal */}
			<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
				<DialogTitle sx={{ m: 0, p: 2 }}>
					Dodaj novega uporabnika
					<IconButton
						aria-label="close"
						onClick={handleClose}
						sx={{ position: "absolute", right: 8, top: 8 }}
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers>
					<AddUser key={formKey} />
				</DialogContent>
			</Dialog>
		</MainLayout>
	);
};

export default UpravljanjeZOsebjem;
