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
		<>
			<Stack spacing={2}>
				<Stack spacing={1}>
					<InputLabel htmlFor="naziv">Room name</InputLabel>
					<OutlinedInput
						id="naziv"
						value={naziv}
						placeholder="Emergency Room"
						onChange={(e) => setNaziv(e.target.value)}
						fullWidth
					/>
				</Stack>

				<Stack spacing={1}>
					<InputLabel htmlFor="lokacija">Location</InputLabel>
					<OutlinedInput
						id="lokacija"
						value={lokacija}
						placeholder="East wing"
						onChange={(e) => setLokacija(e.target.value)}
						fullWidth
					/>
				</Stack>

				<Button variant="contained" color="primary" onClick={handleAdd}>
					ADD ROOM
				</Button>
			</Stack>
		</>
	);
};

export default AddRoom;
