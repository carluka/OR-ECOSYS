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
} from "@mui/material";
import { useState, useEffect } from "react";
import api from "../../api";

type User = {
	iduporabnik: number;
	ime: string;
	priimek: string;
	email: string;
	tip_uporabnika_idtip_uporabnika: number;
};

type Props = {
	user: User;
	onUserUpdated?: () => void;
};

function EditUser({ user, onUserUpdated }: Props) {
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
				console.error("Error fetching job types:", error);
			});

		// Napolni formo z izbranim uporabnikom

		setNaziv(user.ime);
		setPriimek(user.priimek);
		setEmail(user.email);
		setTipZaposlenega(user.tip_uporabnika_idtip_uporabnika.toString());
	}, [user]);

	const handleChange = (event: SelectChangeEvent) => {
		setTipZaposlenega(event.target.value);
	};

	// Posodobitev uporabnika

	const handleUpdateUser = () => {
		const updatedUser = {
			ime: naziv,
			priimek: priimek,
			email: email,
			geslo: password,
			tip_uporabnika_idtip_uporabnika: parseInt(tipZaposlenega),
		};

		console.log(updatedUser);

		api
			.put(`/users/${user.iduporabnik}`, updatedUser)
			.then((response) => {
				console.log("User updated:", response.data);
				if (onUserUpdated) onUserUpdated();
			})
			.catch((error) => {
				console.error("Error updating user:", error);
			});
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				backgroundColor: "#f5f5f5",
			}}
		>
			<Box
				sx={{
					backgroundColor: "white",
					padding: 4,
					borderRadius: 2,
					boxShadow: 3,
					minWidth: 320,
				}}
			>
				<Typography variant="h4" gutterBottom>
					Posodobi Uporabnika
				</Typography>

				<Stack spacing={2}>
					<Stack spacing={1}>
						<InputLabel htmlFor="ime">Ime</InputLabel>
						<OutlinedInput
							id="ime"
							name="ime"
							placeholder="Janez"
							fullWidth
							value={naziv}
							onChange={(e) => setNaziv(e.target.value)}
						/>
					</Stack>

					<Stack spacing={1}>
						<InputLabel htmlFor="priimek">Priimek</InputLabel>
						<OutlinedInput
							id="priimek"
							name="priimek"
							placeholder="Novak"
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
							placeholder="janez.novak@gmail.com"
							fullWidth
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</Stack>

					<Stack spacing={1}>
						<InputLabel htmlFor="tip_zaposlenega">Tip zaposlenega</InputLabel>
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
					</Stack>

					<Stack spacing={1}>
						<InputLabel htmlFor="password">Geslo</InputLabel>
						<OutlinedInput
							id="password"
							name="password"
							type="password"
							placeholder="Vnesite vaše geslo"
							fullWidth
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</Stack>

					<Button
						variant="contained"
						color="primary"
						onClick={handleUpdateUser}
					>
						Posodobi
					</Button>
				</Stack>
			</Box>
		</Box>
	);
}

export default EditUser;
