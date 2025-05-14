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
	deviceId: number;
	onServiceAdded: () => void;
}

const AddService: React.FC<Props> = ({ deviceId, onServiceAdded }) => {
	const [datum, setDatum] = useState<string>("");
	const [ura, setUra] = useState<string>("");
	const [komentar, setKomentar] = useState<string>("");

	const handleAdd = () => {
		const payload = {
			naprava_idnaprava: deviceId,
			datum,
			ura,
			komentar,
		};

		api
			.post("/services", payload)
			.then(() => {
				onServiceAdded();
			})
			.catch((err) => {
				console.error("Error adding service:", err);
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
					Dodaj servis
				</Typography>

				<Stack spacing={2}>
					<Stack spacing={1}>
						<InputLabel htmlFor="datum">Datum</InputLabel>
						<OutlinedInput
							id="datum"
							type="date"
							value={datum}
							onChange={(e) => setDatum(e.target.value)}
							fullWidth
						/>
					</Stack>

					<Stack spacing={1}>
						<InputLabel htmlFor="ura">Ura</InputLabel>
						<OutlinedInput
							id="ura"
							type="time"
							value={ura}
							onChange={(e) => setUra(e.target.value)}
							fullWidth
						/>
					</Stack>

					<Stack spacing={1}>
						<InputLabel htmlFor="komentar">Komentar</InputLabel>
						<OutlinedInput
							id="komentar"
							value={komentar}
							onChange={(e) => setKomentar(e.target.value)}
							placeholder="Opis opravljenega servisa"
							fullWidth
							multiline
							rows={3}
						/>
					</Stack>

					<Button variant="outlined" color="primary" onClick={handleAdd}>
						Shrani servis
					</Button>
				</Stack>
			</Box>
		</Box>
	);
};

export default AddService;
