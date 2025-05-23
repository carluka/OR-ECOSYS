import {
	Box,
	Button,
	InputLabel,
	OutlinedInput,
	Stack,
	Typography,
	Select,
	MenuItem,
	SelectChangeEvent,
	FormControl,
} from "@mui/material";
import { useState, useEffect } from "react";
import api from "../../api";

type Props = {
	onUserAdded?: () => void;
};

function AddUser({ onUserAdded }: Props) {
	const [tipZaposlenega, setTipZaposlenega] = useState<string>("");
	const [naziv, setNaziv] = useState<string>("");
	const [priimek, setPriimek] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [tipiZaposlenih, setTipiZaposlenih] = useState<
		{ idtip_uporabnika: number; naziv: string }[]
	>([]);

	// Pridobitev podatkov o tipih zaposlenih

	useEffect(() => {
		api
			.get("/userType")
			.then((response) => {
				if (Array.isArray(response.data.data)) {
					setTipiZaposlenih(response.data.data);
				} else {
					console.error("API response is not an array:", response.data);
				}
			})
			.catch((error) => {
				console.error("Error fetching data for user type:", error);
			});
	}, []);

	const handleChange = (event: SelectChangeEvent) => {
		setTipZaposlenega(event.target.value);
	};

	// Dodajanje novega uporabnika

	const handleAddUser = () => {
		const newUser = {
			ime: naziv,
			priimek: priimek,
			email: email,
			geslo: password,
			tip_uporabnika_idtip_uporabnika: parseInt(tipZaposlenega),
		};

		console.log(newUser);

		api
			.post("/users", newUser)
			.then((response) => {
				console.log("User added:", response.data);
				if (onUserAdded) onUserAdded();
			})
			.catch((error) => {
				console.error("Error adding user:", error);
			});
	};

	return (
		<>
			<Stack spacing={2}>
				<Stack spacing={1}>
					<InputLabel htmlFor="ime">Name</InputLabel>
					<OutlinedInput
						id="ime"
						name="ime"
						placeholder="Joe"
						fullWidth
						value={naziv}
						onChange={(e) => setNaziv(e.target.value)}
					/>
				</Stack>

				<Stack spacing={1}>
					<InputLabel htmlFor="priimek">Surname</InputLabel>
					<OutlinedInput
						id="priimek"
						name="priimek"
						placeholder="Doe"
						fullWidth
						value={priimek}
						onChange={(e) => setPriimek(e.target.value)}
					/>
				</Stack>

				<Stack spacing={1}>
					<InputLabel htmlFor="email">Email</InputLabel>
					<OutlinedInput
						id="email"
						name="email"
						type="email"
						placeholder="joe.doe@gmail.com"
						fullWidth
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</Stack>

				<Stack spacing={1}>
					<InputLabel htmlFor="tip_zaposlenega">User type</InputLabel>
					<FormControl fullWidth>
						<InputLabel htmlFor="tip_zaposlenega">User type</InputLabel>
						<Select
							id="tip_zaposlenega"
							name="tip_zaposlenega"
							value={tipZaposlenega}
							onChange={handleChange}
							fullWidth
						>
							{tipiZaposlenih.map((tip) => (
								<MenuItem
									key={tip.idtip_uporabnika}
									value={tip.idtip_uporabnika.toString()}
								>
									{tip.naziv}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Stack>

				<Stack spacing={1}>
					<InputLabel htmlFor="password">Password</InputLabel>
					<OutlinedInput
						id="password"
						name="password"
						type="password"
						placeholder="Insert password"
						fullWidth
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</Stack>

				<Button variant="contained" color="primary" onClick={handleAddUser}>
					ADD USER
				</Button>
			</Stack>
		</>
	);
}

export default AddUser;
