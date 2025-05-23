import React, { useState } from "react";
import { Button, InputLabel, OutlinedInput, Stack } from "@mui/material";
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
		<>
			<Stack spacing={2}>
				<Stack spacing={1}>
					<InputLabel htmlFor="datum">Date</InputLabel>
					<OutlinedInput
						id="datum"
						type="date"
						value={datum}
						onChange={(e) => setDatum(e.target.value)}
						fullWidth
					/>
				</Stack>

				<Stack spacing={1}>
					<InputLabel htmlFor="ura">Time</InputLabel>
					<OutlinedInput
						id="ura"
						type="time"
						value={ura}
						onChange={(e) => setUra(e.target.value)}
						fullWidth
					/>
				</Stack>

				<Stack spacing={1}>
					<InputLabel htmlFor="komentar">Comment</InputLabel>
					<OutlinedInput
						id="komentar"
						value={komentar}
						onChange={(e) => setKomentar(e.target.value)}
						placeholder="Description of service"
						fullWidth
						multiline
						rows={3}
					/>
				</Stack>

				<Button variant="contained" color="primary" onClick={handleAdd}>
					ADD SERVICE
				</Button>
			</Stack>
		</>
	);
};

export default AddService;
