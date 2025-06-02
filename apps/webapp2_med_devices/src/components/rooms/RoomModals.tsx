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
import AddRoom from "./AddRoom";
import AddDeviceRoom from "./AddDeviceRoom";
import DeviceReportModal from "../devices/DeviceReportModal";

interface RoomModalsProps {
	// Add Room Modal
	openAddRoom: boolean;
	onCloseAddRoom: () => void;
	onRoomAdded: () => void;

	// Add Device Modal
	openAddDeviceRoom: boolean;
	selectedRoomId: number | null;
	onCloseAddDeviceRoom: () => void;
	onDeviceAdded: () => void;

	// Delete Modal
	openDeleteModal: boolean;
	selectedCount: number;
	onCloseDeleteModal: () => void;
	onConfirmDelete: () => void;

	// Report Modal
	openReportModal: boolean;
	reportDeviceId: number | null;
	onCloseReportModal: () => void;
}

export const RoomModals: React.FC<RoomModalsProps> = ({
	openAddRoom,
	onCloseAddRoom,
	onRoomAdded,
	openAddDeviceRoom,
	selectedRoomId,
	onCloseAddDeviceRoom,
	onDeviceAdded,
	openDeleteModal,
	selectedCount,
	onCloseDeleteModal,
	onConfirmDelete,
	openReportModal,
	reportDeviceId,
	onCloseReportModal,
}) => {
	return (
		<>
			{/* Add Room Modal */}
			<Dialog
				open={openAddRoom}
				onClose={onCloseAddRoom}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle sx={{ m: 0, p: 2 }}>
					Create new room
					<IconButton
						aria-label="close"
						onClick={onCloseAddRoom}
						sx={{ position: "absolute", right: 8, top: 8 }}
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers>
					<AddRoom onClose={onCloseAddRoom} onAdded={onRoomAdded} />
				</DialogContent>
			</Dialog>

			{/* Add Device to Room Modal */}
			<Dialog
				open={openAddDeviceRoom}
				onClose={onCloseAddDeviceRoom}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle sx={{ m: 0, p: 2 }}>
					Add devices to room
					<IconButton
						aria-label="close"
						onClick={onCloseAddDeviceRoom}
						sx={{ position: "absolute", right: 8, top: 8 }}
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers>
					{selectedRoomId && (
						<AddDeviceRoom
							roomId={selectedRoomId}
							onClose={onCloseAddDeviceRoom}
							onAdded={onDeviceAdded}
						/>
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
						Are you sure you want to delete {selectedCount} selected{" "}
						{selectedCount === 1 ? "room" : "rooms"}?
					</Typography>
					<Typography variant="body2" color="error" sx={{ mb: 2 }}>
						This action cannot be undone and will also remove all the operations
						that are associated with that room.
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

			{/* Report Modal */}
			<DeviceReportModal
				open={openReportModal}
				onClose={onCloseReportModal}
				deviceId={reportDeviceId}
			/>
		</>
	);
};
