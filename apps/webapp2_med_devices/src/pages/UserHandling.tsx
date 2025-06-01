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
	TablePagination,
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

const UserHandling: React.FC = () => {
	const [users, setUsers] = useState<UserOverview[]>([]);
	const [selected, setSelected] = useState<number[]>([]);
	const [openModal, setOpenModal] = useState(false);
	const [formKey, setFormKey] = useState(0);
	const [editingUser, setEditingUser] = useState<FullUser | null>(null);

	// Pagination state
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(15);

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
		if (!selected.length) return alert("Choose at least one user.");
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
			alert("Choose exactly one user.");
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
			.catch(() => alert("Error loading users."));
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

	// Pagination handlers
	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	// Paginate users for current page
	const paginatedUsers = users.slice(
		page * rowsPerPage,
		page * rowsPerPage + rowsPerPage
	);

	return (
		<MainLayout>
			<Typography variant="h4" gutterBottom sx={{ fontWeight: "600" }}>
				USERS
			</Typography>

			<TableContainer component={Paper}>
				<Table>
					<TableHead sx={{ bgcolor: "#2C2D2D" }}>
						<TableRow>
							<TableCell padding="checkbox" sx={{ color: "white" }}>
								<Checkbox
									indeterminate={
										selected.length > 0 && selected.length < users.length
									}
									checked={users.length > 0 && selected.length === users.length}
									onChange={toggleAll}
									sx={{ color: "white" }}
								/>
							</TableCell>
							<TableCell sx={{ color: "white" }}>Name</TableCell>
							<TableCell sx={{ color: "white" }}>Surname</TableCell>
							<TableCell sx={{ color: "white" }}>Email</TableCell>
							<TableCell sx={{ color: "white" }}>User Type</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{paginatedUsers.map((u) => (
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
				<TablePagination
					rowsPerPageOptions={[5, 10, 25]}
					component="div"
					count={users.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
				/>
			</TableContainer>

			<Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
				<Stack direction="row" spacing={2}>
					<Button variant="outlined" onClick={openAdd}>
						ADD USER
					</Button>
					<Button
						variant="outlined"
						onClick={openEdit}
						disabled={selected.length !== 1}
					>
						EDIT USER
					</Button>
					<Button
						variant="outlined"
						color="error"
						onClick={handleDelete}
						disabled={selected.length < 1}
					>
						REMOVE USER
					</Button>
				</Stack>
			</Box>

			<Dialog open={openModal} onClose={closeModal} fullWidth maxWidth="sm">
				<DialogTitle sx={{ m: 0, p: 2 }}>
					{editingUser
						? `Edit user: ${editingUser.ime} ${editingUser.priimek}`
						: "Add new user"}
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

export default UserHandling;
