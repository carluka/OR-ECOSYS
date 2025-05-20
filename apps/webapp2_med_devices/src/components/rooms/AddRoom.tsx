import React, { useState } from "react";
import {
	Box,
	Button,
	InputLabel,
	OutlinedInput,
	Stack,
	Typography,
} from "@mui/material";
import api from "../../api";

interface Props {
	onClose: () => void;
	onAdded: () => void;
}

const AddRoom: React.FC<Props> = ({ onClose, onAdded }) => {
	const [naziv, setNaziv] = useState<string>("");
	const [lokacija, setLokacija] = useState<string>("");

	const handleAdd = () => {
		const payload = {
			naziv,
			lokacija,
		};

		api
			.post("/rooms", payload)
			.then(() => {
				onAdded();
				onClose();
			})
			.catch((err) => {
				console.error("Error adding room:", err);
				alert("Napaka pri dodajanju sobe.");
			});
	};

	return (
		<Box
			sx={{
				minHeight: "100%",
				display: "flex",
				justifyContent: "center",
				alignItems: "start",
				pt: 2,
			}}
		>
			<Box
				sx={{
					backgroundColor: "white",
					padding: 3,
					borderRadius: 2,
					boxShadow: 3,
					width: "100%",
				}}
			>
				<Typography variant="h6" gutterBottom>
					Dodaj sobo
				</Typography>

				<Stack spacing={2}>
					<Stack spacing={1}>
						<InputLabel htmlFor="naziv">Naziv</InputLabel>
						<OutlinedInput
							id="naziv"
							value={naziv}
							onChange={(e) => setNaziv(e.target.value)}
							fullWidth
						/>
					</Stack>

					<Stack spacing={1}>
						<InputLabel htmlFor="lokacija">Lokacija</InputLabel>
						<OutlinedInput
							id="lokacija"
							value={lokacija}
							onChange={(e) => setLokacija(e.target.value)}
							fullWidth
						/>
					</Stack>

					<Button variant="outlined" color="primary" onClick={handleAdd}>
						Shrani sobo
					</Button>
					<Button variant="text" onClick={onClose}>
						Prekliči
					</Button>
				</Stack>
			</Box>
		</Box>
	);
};

export default AddRoom;
