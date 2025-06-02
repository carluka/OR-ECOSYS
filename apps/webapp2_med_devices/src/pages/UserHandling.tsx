import type React from "react";
import { useState } from "react";
import MainLayout from "../layout/MainLayout";
import { Box, Alert, Typography } from "@mui/material";

import { useUsers } from "../hooks/useUsers";
import { useUserFilters } from "../hooks/useUserFilters";
import { useUserSelection } from "../hooks/useUserSelection";

import UserHeader from "../components/users/UserHeader";
import UserSummaryCards from "../components/users/UserSummaryCards";
import UserSearchAndActions from "../components/users/UserSearchAndActions";
import UserActionButtons from "../components/users/UserActionButtons";
import UserTable from "../components/users/UserTable";
import UserModals from "../components/users/UserModals";
import UserContextMenu from "../components/users/UserContextMenu";

import type { FullUser } from "../types/user.types";

const UserHandling: React.FC = () => {
	// Fetch users and user types
	const {
		users,
		loading,
		error,
		fetchUsers,
		deleteUsers,
		getUserById,
		getUserStatistics,
	} = useUsers();

	// Filter and search users
	const {
		searchTerm,
		setSearchTerm,
		filterUserType,
		setFilterUserType,
		filteredUsers,
	} = useUserFilters(users);

	// User selection
	const { selected, setSelected, toggleAll, toggleOne } =
		useUserSelection(filteredUsers);

	// Modal states
	const [openModal, setOpenModal] = useState(false);
	const [formKey, setFormKey] = useState(0);
	const [editingUser, setEditingUser] = useState<FullUser | null>(null);
	const [openDeleteModal, setOpenDeleteModal] = useState(false);

	// Context menu
	const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

	// Pagination
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(15);

	// Get statistics
	const { totalUsers, adminUsers, regularUsers, uniqueUserTypes } =
		getUserStatistics();

	// Handlers
	const handleOpenAdd = () => {
		setEditingUser(null);
		setFormKey((k) => k + 1);
		setOpenModal(true);
	};

	const handleOpenEdit = async () => {
		if (selected.length !== 1) {
			alert("Choose exactly one user.");
			return;
		}

		const user = await getUserById(selected[0]);
		if (user) {
			setEditingUser(user);
			setFormKey((k) => k + 1);
			setOpenModal(true);
		} else {
			alert("Error loading user.");
		}
	};

	const handleCloseModal = () => {
		setOpenModal(false);
		setEditingUser(null);
	};

	const handleUserSaved = () => {
		fetchUsers();
		setSelected([]);
		handleCloseModal();
	};

	const handleOpenDelete = () => {
		if (!selected.length) return alert("Choose at least one user.");
		setOpenDeleteModal(true);
	};

	const handleConfirmDelete = async () => {
		const success = await deleteUsers(selected);
		if (success) {
			setSelected([]);
			fetchUsers();
			setOpenDeleteModal(false);
		} else {
			alert("Error deleting users.");
		}
	};

	// Menu handlers
	const handleMenuOpen = (
		event: React.MouseEvent<HTMLElement>,
		userId: number
	) => {
		event.stopPropagation();
		setMenuAnchorEl(event.currentTarget);
		setSelectedUserId(userId);
	};

	const handleMenuClose = () => {
		setMenuAnchorEl(null);
		setSelectedUserId(null);
	};

	const handleEditFromMenu = async (event: React.MouseEvent) => {
		event.stopPropagation();
		if (selectedUserId) {
			const user = await getUserById(selectedUserId);
			if (user) {
				setEditingUser(user);
				setFormKey((k) => k + 1);
				setOpenModal(true);
			} else {
				alert("Error loading user.");
			}
		}
		handleMenuClose();
	};

	const handleDeleteFromMenu = () => {
		if (selectedUserId) {
			setSelected([selectedUserId]);
			setOpenDeleteModal(true);
		}
		handleMenuClose();
	};

	// Pagination handlers
	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setRowsPerPage(Number.parseInt(event.target.value, 10));
		setPage(0);
	};

	if (loading) {
		return (
			<MainLayout>
				<Box
					sx={{
						p: 3,
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						minHeight: "400px",
					}}
				>
					<Typography sx={{ ml: 2 }}>Loading users...</Typography>
				</Box>
			</MainLayout>
		);
	}

	if (error) {
		return (
			<MainLayout>
				<Box sx={{ p: 3 }}>
					<Alert severity="error">{error}</Alert>
				</Box>
			</MainLayout>
		);
	}

	return (
		<MainLayout>
			{/* Header */}
			<UserHeader />

			{/* Summary Cards */}
			<UserSummaryCards
				totalUsers={totalUsers}
				adminUsers={adminUsers}
				regularUsers={regularUsers}
				uniqueUserTypes={uniqueUserTypes}
			/>

			{/* Search */}
			<UserSearchAndActions
				searchTerm={searchTerm}
				onSearchChange={setSearchTerm}
				onAddUser={handleOpenAdd}
			/>

			{/* Action Buttons */}
			<UserActionButtons
				onEditUser={handleOpenEdit}
				onDeleteUsers={handleOpenDelete}
				canEdit={selected.length === 1}
				canDelete={selected.length > 0}
				selectedCount={selected.length}
			/>

			{/* Users Table */}
			<UserTable
				users={users}
				filteredUsers={filteredUsers}
				selected={selected}
				page={page}
				rowsPerPage={rowsPerPage}
				onToggleAll={toggleAll}
				onToggleOne={toggleOne}
				onMenuOpen={handleMenuOpen}
				onChangePage={handleChangePage}
				onChangeRowsPerPage={handleChangeRowsPerPage}
				searchTerm={searchTerm}
			/>

			{/* Modals */}
			<UserModals
				openModal={openModal}
				openDeleteModal={openDeleteModal}
				editingUser={editingUser}
				formKey={formKey}
				selected={selected}
				onCloseModal={handleCloseModal}
				onCloseDeleteModal={() => setOpenDeleteModal(false)}
				onConfirmDelete={handleConfirmDelete}
				onUserSaved={handleUserSaved}
			/>

			{/* Context Menu */}
			<UserContextMenu
				anchorEl={menuAnchorEl}
				onClose={handleMenuClose}
				onEdit={handleEditFromMenu}
				onDelete={handleDeleteFromMenu}
			/>
		</MainLayout>
	);
};

export default UserHandling;
