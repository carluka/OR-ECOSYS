import type React from "react";
import { Menu, MenuItem, ListItemIcon, Divider } from "@mui/material";
import { PictureAsPdf, Edit, Delete } from "@mui/icons-material";

interface DeviceContextMenuProps {
	anchorEl: HTMLElement | null;
	open: boolean;
	onClose: () => void;
	onViewReport: () => void;
	onEditDevice: () => void;
	onDeleteDevice: () => void;
}

const DeviceContextMenu: React.FC<DeviceContextMenuProps> = ({
	anchorEl,
	open,
	onClose,
	onViewReport,
	onEditDevice,
	onDeleteDevice,
}) => {
	return (
		<Menu anchorEl={anchorEl} open={open} onClose={onClose}>
			<MenuItem onClick={onViewReport}>
				<ListItemIcon>
					<PictureAsPdf fontSize="small" />
				</ListItemIcon>
				View Report
			</MenuItem>
			<MenuItem onClick={onEditDevice}>
				<ListItemIcon>
					<Edit fontSize="small" />
				</ListItemIcon>
				Edit Device
			</MenuItem>
			<Divider />
			<MenuItem onClick={onDeleteDevice} sx={{ color: "error.main" }}>
				<ListItemIcon>
					<Delete fontSize="small" color="error" />
				</ListItemIcon>
				Delete Device
			</MenuItem>
		</Menu>
	);
};

export default DeviceContextMenu;
