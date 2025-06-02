import type React from "react";
import { Box, Button } from "@mui/material";

interface UserActionButtonsProps {
	onEditUser: () => void;
	onDeleteUsers: () => void;
	canEdit: boolean;
	canDelete: boolean;
	selectedCount: number;
}

const UserActionButtons: React.FC<UserActionButtonsProps> = ({
	onEditUser,
	onDeleteUsers,
	canEdit,
	canDelete,
	selectedCount,
}) => {
	return (
		<Box
			sx={{
				mt: 3,
				display: "flex",
				justifyContent: "flex-end",
				gap: 2,
				mb: 1,
			}}
		>
			<Button
				variant="outlined"
				color="primary"
				onClick={onEditUser}
				disabled={!canEdit}
			>
				Edit User
			</Button>
			<Button
				variant="outlined"
				color="error"
				onClick={onDeleteUsers}
				disabled={!canDelete}
			>
				Remove User{selectedCount > 1 ? "s" : ""}
			</Button>
		</Box>
	);
};

export default UserActionButtons;
