import type React from "react";
import { Menu, MenuItem, ListItemIcon, Divider } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

interface UserContextMenuProps {
	anchorEl: HTMLElement | null;
	onClose: () => void;
	onEdit: (event: React.MouseEvent) => void;
	onDelete: () => void;
}

const UserContextMenu: React.FC<UserContextMenuProps> = ({
	anchorEl,
	onClose,
	onEdit,
	onDelete,
}) => {
	return (
		<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
			<MenuItem onClick={onEdit}>
				<ListItemIcon>
					<Edit fontSize="small" />
				</ListItemIcon>
				Edit User
			</MenuItem>
			<Divider />
			<MenuItem onClick={onDelete} sx={{ color: "error.main" }}>
				<ListItemIcon>
					<Delete fontSize="small" color="error" />
				</ListItemIcon>
				Delete User
			</MenuItem>
		</Menu>
	);
};

export default UserContextMenu;
