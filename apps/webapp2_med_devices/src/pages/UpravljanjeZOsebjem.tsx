// src/pages/UpravljanjeZOsebjem.tsx
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
	Stack,
	Dialog,
	DialogTitle,
	DialogContent,
	IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddUser from "../components/users/AddUser";
import EditUser from "../components/users/EditUser";
import api from "../api";

interface UserOverview {
	iduporabnik: number;
	ime: string;
	priimek: string;
	email: string;
	TipUporabnika: {
		naziv: string;
	};
}

interface FullUser {
	iduporabnik: number;
	ime: string;
	priimek: string;
	email: string;
	geslo?: string;
	tip_uporabnika_idtip_uporabnika: number;
}

const UpravljanjeZOsebjem: React.FC = () => {
	const [users, setUsers] = useState<UserOverview[]>([]);
	const [selected, setSelected] = useState<number[]>([]);
	const [openModal, setOpenModal] = useState(false);
	const [formKey, setFormKey] = useState(0);
	const [editingUser, setEditingUser] = useState<FullUser | null>(null);

	const fetchUsers = () => {
		api
			.get("/users")
			.then((res) => setUsers(res.data.data))
			.catch(console.error);
	};
	useEffect(fetchUsers, []);

	const toggleAll = () =>
		setSelected((sel) =>
			sel.length === users.length ? [] : users.map((u) => u.iduporabnik)
		);

	const toggleOne = (id: number) =>
		setSelected((sel) =>
			sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]
		);

	const handleDelete = () => {
		if (!selected.length) return alert("Izberi vsaj enega uporabnika.");
		api
			.delete("/users/deleteMultiple", { data: { ids: selected } })
			.then(() => {
				setSelected([]);
				fetchUsers();
			})
			.catch(console.error);
	};

	const openAdd = () => {
		setEditingUser(null);
		setFormKey((k) => k + 1);
		setOpenModal(true);
	};

	const openEdit = () => {
		if (selected.length !== 1) {
			alert("Izberi natanko enega uporabnika za urejanje.");
			return;
		}
		const id = selected[0];
		api
			.get<{ data: FullUser }>(`/users/${id}`)
			.then((res) => {
				setEditingUser(res.data.data);
				setFormKey((k) => k + 1);
				setOpenModal(true);
			})
			.catch(() => alert("Napaka pri nalaganju podatkov."));
	};

	const closeModal = () => {
		setOpenModal(false);
		setEditingUser(null);
	};

	const handleSaved = () => {
		fetchUsers();
		setSelected([]);
		closeModal();
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
							<TableCell padding="checkbox">
								<Checkbox
									indeterminate={
										selected.length > 0 && selected.length < users.length
									}
									checked={users.length > 0 && selected.length === users.length}
									onChange={toggleAll}
								/>
							</TableCell>
							<TableCell>Ime</TableCell>
							<TableCell>Priimek</TableCell>
							<TableCell>Email</TableCell>
							<TableCell>Tip zaposlenega</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{users.map((u) => (
							<TableRow key={u.iduporabnik}>
								<TableCell padding="checkbox">
									<Checkbox
										checked={selected.includes(u.iduporabnik)}
										onChange={() => toggleOne(u.iduporabnik)}
									/>
								</TableCell>
								<TableCell>{u.ime}</TableCell>
								<TableCell>{u.priimek}</TableCell>
								<TableCell>{u.email}</TableCell>
								<TableCell>{u.TipUporabnika.naziv}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
				<Stack direction="row" spacing={2}>
					<Button variant="outlined" onClick={openEdit}>
						Uredi uporabnika
					</Button>
					<Button variant="outlined" onClick={openAdd}>
						Dodaj uporabnika
					</Button>
					<Button variant="outlined" color="error" onClick={handleDelete}>
						Odstrani uporabnika
					</Button>
				</Stack>
			</Box>

			<Dialog open={openModal} onClose={closeModal} fullWidth maxWidth="sm">
				<DialogTitle sx={{ m: 0, p: 2 }}>
					{editingUser
						? `Uredi uporabnika: ${editingUser.ime} ${editingUser.priimek}`
						: "Dodaj novega uporabnika"}
					<IconButton
						aria-label="close"
						onClick={closeModal}
						sx={{ position: "absolute", right: 8, top: 8 }}
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers>
					{editingUser ? (
						<EditUser
							key={formKey}
							user={editingUser}
							onUserUpdated={handleSaved}
						/>
					) : (
						<AddUser key={formKey} onUserAdded={handleSaved} />
					)}
				</DialogContent>
			</Dialog>
		</MainLayout>
	);
};

export default UpravljanjeZOsebjem;
