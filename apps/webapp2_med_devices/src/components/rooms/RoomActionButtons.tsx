import type React from "react";
import { Box, Button } from "@mui/material";

interface RoomActionButtonsProps {
	selectedCount: number;
	canAddDevices: boolean;
	canDelete: boolean;
	onAddDevices: () => void;
	onDelete: () => void;
}

export const RoomActionButtons: React.FC<RoomActionButtonsProps> = ({
	selectedCount,
	canAddDevices,
	canDelete,
	onAddDevices,
	onDelete,
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
				onClick={onAddDevices}
				disabled={!canAddDevices}
			>
				Add Devices to Room
			</Button>
			<Button
				variant="outlined"
				color="error"
				onClick={onDelete}
				disabled={!canDelete}
			>
				Delete Room{selectedCount > 1 ? "s" : ""}
			</Button>
		</Box>
	);
};
