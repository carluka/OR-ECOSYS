import type React from "react";
import { Menu, MenuItem, ListItemIcon, Divider } from "@mui/material";
import { Add, Delete, LockOutlined } from "@mui/icons-material";

interface RoomContextMenuProps {
	anchorEl: HTMLElement | null;
	open: boolean;
	selectedRoomId: number | null;
	isRoomActive: boolean;
	onClose: () => void;
	onAddDevices: () => void;
	onDeleteRoom: () => void;
}

export const RoomContextMenu: React.FC<RoomContextMenuProps> = ({
	anchorEl,
	open,
	selectedRoomId,
	isRoomActive,
	onClose,
	onAddDevices,
	onDeleteRoom,
}) => {
	return (
		<Menu anchorEl={anchorEl} open={open} onClose={onClose}>
			{selectedRoomId && !isRoomActive && (
				<MenuItem onClick={onAddDevices}>
					<ListItemIcon>
						<Add fontSize="small" />
					</ListItemIcon>
					Add Devices
				</MenuItem>
			)}
			{selectedRoomId && !isRoomActive && <Divider />}
			{selectedRoomId && !isRoomActive ? (
				<MenuItem onClick={onDeleteRoom} sx={{ color: "error.main" }}>
					<ListItemIcon>
						<Delete fontSize="small" color="error" />
					</ListItemIcon>
					Delete Room
				</MenuItem>
			) : (
				<MenuItem disabled sx={{ color: "text.disabled" }}>
					<ListItemIcon>
						<LockOutlined fontSize="small" color="disabled" />
					</ListItemIcon>
					Active Room (Cannot Modify)
				</MenuItem>
			)}
		</Menu>
	);
};
