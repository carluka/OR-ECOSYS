import type React from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	IconButton,
	Typography,
	Box,
	Button,
} from "@mui/material";
import { Close as CloseIcon, Delete } from "@mui/icons-material";
import AddUser from "./AddUser";
import EditUser from "./EditUser";
import type { FullUser } from "../../types/user.types";

interface UserModalsProps {
	openModal: boolean;
	openDeleteModal: boolean;
	editingUser: FullUser | null;
	formKey: number;
	selected: number[];
	onCloseModal: () => void;
	onCloseDeleteModal: () => void;
	onConfirmDelete: () => void;
	onUserSaved: () => void;
}

const UserModals: React.FC<UserModalsProps> = ({
	openModal,
	openDeleteModal,
	editingUser,
	formKey,
	selected,
	onCloseModal,
	onCloseDeleteModal,
	onConfirmDelete,
	onUserSaved,
}) => {
	return (
		<>
			{/* Add/Edit User Modal */}
			<Dialog open={openModal} onClose={onCloseModal} fullWidth maxWidth="sm">
				<DialogTitle sx={{ m: 0, p: 2 }}>
					{editingUser
						? `Edit user: ${editingUser.ime} ${editingUser.priimek}`
						: "Add new user"}
					<IconButton
						aria-label="close"
						onClick={onCloseModal}
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
							onUserUpdated={onUserSaved}
						/>
					) : (
						<AddUser key={formKey} onUserAdded={onUserSaved} />
					)}
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Modal */}
			<Dialog
				open={openDeleteModal}
				onClose={onCloseDeleteModal}
				PaperProps={{
					elevation: 3,
					sx: { borderRadius: 2 },
				}}
			>
				<DialogTitle
					sx={{
						bgcolor: "error.light",
						color: "error.contrastText",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					Confirm Deletion
					<IconButton
						aria-label="close"
						onClick={onCloseDeleteModal}
						size="small"
						sx={{ color: "inherit" }}
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent sx={{ pt: 2, pb: 2, px: 3, mt: 1 }}>
					<Typography variant="body1" gutterBottom>
						Are you sure you want to delete {selected.length} selected{" "}
						{selected.length === 1 ? "user" : "users"}?
					</Typography>
					<Typography variant="body2" color="error" sx={{ mb: 2 }}>
						This action cannot be undone and will permanently remove the user(s)
						from the system.
					</Typography>
					<Box
						sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}
					>
						<Button variant="outlined" onClick={onCloseDeleteModal}>
							Cancel
						</Button>
						<Button
							variant="contained"
							color="error"
							onClick={onConfirmDelete}
							startIcon={<Delete />}
						>
							Delete
						</Button>
					</Box>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default UserModals;
