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

const UpravljanjeZOsebjem: React.FC = () => {
	const [open, setOpen] = useState(false);
	const [formKey, setFormKey] = useState(0);
	const [users, setUsers] = useState<any[]>([]);
	const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
	const [userToEdit, setUserToEdit] = useState<any | null>(null);

	// Pridobivanje podatkov o uporabnikih
	const fetchUsers = () => {
		api
			.get("/users")
			.then((response) => {
				console.log("API Response:", response.data.data);
				setUsers(response.data.data);
			})
			.catch((error) => {
				console.error("Error fetching user data:", error);
			});
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	// Odpri modalno okno za dodajanje ali urejanje uporabnika
	const handleOpen = () => {
		setFormKey((prev) => prev + 1);
		setOpen(true);
	};

	// Zapri modalno okno
	const handleClose = () => {
		setOpen(false);
		setUserToEdit(null);
	};

	const handleCheckboxChange = (id: number) => {
		setSelectedUsers((prevSelectedUsers) => {
			if (prevSelectedUsers.includes(id)) {
				// Remove user if already selected
				return prevSelectedUsers.filter((userId) => userId !== id);
			} else {
				// Add user if not already selected
				return [...prevSelectedUsers, id];
			}
		});
	};

	// Izbriši izbrane uporabnike
	const handleDeleteUsers = () => {
		if (selectedUsers.length === 0) {
			console.log("No users selected for deletion.");
			return;
		}
		console.log("Deleting users with IDs:", selectedUsers);

		api
			.delete("/users/deleteMultiple", { data: { ids: selectedUsers } })
			.then((response) => {
				console.log(response.data);

				setUsers((prevUsers) =>
					prevUsers.filter((user) => !selectedUsers.includes(user.iduporabnik))
				);
				setSelectedUsers([]);
			})
			.catch((error) => {
				console.error("Failed to delete users:", error);
			});
	};

	// Odpri modalno okno za urejanje uporabnika z izbranim uporabnikom
	const handleEditUser = () => {
		if (selectedUsers.length !== 1) {
			alert("Please select exactly one user to edit.");
			return;
		}
		const selectedUser = users.find(
			(user) => user.iduporabnik === selectedUsers[0]
		);
		if (selectedUser) {
			setUserToEdit(selectedUser);
			setOpen(true);
		}
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
									checked={users.length === selectedUsers.length}
									onChange={() =>
										setSelectedUsers(
											selectedUsers.length === users.length
												? []
												: users.map((u) => u.iduporabnik)
										)
									}
								/>
							</TableCell>
							<TableCell>Ime</TableCell>
							<TableCell>Priimek</TableCell>
							<TableCell>Email</TableCell>
							<TableCell>Tip zaposlenega</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{users.map((user, index) => (
							<TableRow key={index}>
								<TableCell padding="checkbox">
									<Checkbox
										checked={selectedUsers.includes(user.iduporabnik)}
										onChange={() => handleCheckboxChange(user.iduporabnik)}
									/>
								</TableCell>
								<TableCell>{user.ime}</TableCell>
								<TableCell>{user.priimek}</TableCell>
								<TableCell>{user.email}</TableCell>
								<TableCell>{user.TipUporabnika.naziv}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
				<Stack direction="row" spacing={3}>
					<Button variant="outlined" onClick={handleEditUser}>
						Uredi uporabnika
					</Button>
					<Button variant="outlined" onClick={handleOpen}>
						Dodaj uporabnika
					</Button>
					<Button variant="outlined" color="error" onClick={handleDeleteUsers}>
						Odstrani uporabnika
					</Button>
				</Stack>
			</Box>

			{/* Modal za urejanje uporabnika in dodajanje uporabnikov */}
			<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
				<DialogTitle sx={{ m: 0, p: 2 }}>
					{userToEdit
						? `Uredi uporabnika: ${userToEdit.ime} ${userToEdit.priimek}`
						: "Dodaj uporabnika"}
					<IconButton
						aria-label="close"
						onClick={handleClose}
						sx={{ position: "absolute", right: 8, top: 8 }}
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers>
					{userToEdit ? (
						<EditUser user={userToEdit} onUserUpdated={fetchUsers} />
					) : (
						<AddUser onUserAdded={fetchUsers} />
					)}
				</DialogContent>
			</Dialog>
		</MainLayout>
	);
};

export default UpravljanjeZOsebjem;
