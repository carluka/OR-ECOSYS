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
import AddDevice from "./AddDevice";
import EditDevice from "./EditDevice";
import AddService from "../services/AddService";
import DeviceReportModal from "./DeviceReportModal";
import type { FullDevice, DeviceOverview } from "../../types/device.types";

interface DeviceModalsProps {
	// Add/Edit Device Modal
	openModal: boolean;
	editingDevice: FullDevice | null;
	formKey: number;
	onCloseModal: () => void;
	onDeviceSaved: () => void;

	// Add Service Modal
	openAddServiceModal: boolean;
	addServiceDeviceId: number | null;
	devices: DeviceOverview[];
	onCloseAddServiceModal: () => void;
	onServiceAdded: () => void;

	// Delete Device Modal
	openDeleteModal: boolean;
	selectedCount: number;
	onCloseDeleteModal: () => void;
	onConfirmDelete: () => void;

	// Delete Service Modal
	openDeleteServiceModal: boolean;
	serviceDeleteDeviceId: number | null;
	selectedServicesCount: number;
	onCloseDeleteServiceModal: () => void;
	onConfirmDeleteServices: () => void;

	// Report Modal
	openReportModal: boolean;
	reportDeviceId: number | null;
	onCloseReportModal: () => void;
}

const DeviceModals: React.FC<DeviceModalsProps> = ({
	openModal,
	editingDevice,
	formKey,
	onCloseModal,
	onDeviceSaved,
	openAddServiceModal,
	addServiceDeviceId,
	devices,
	onCloseAddServiceModal,
	onServiceAdded,
	openDeleteModal,
	selectedCount,
	onCloseDeleteModal,
	onConfirmDelete,
	openDeleteServiceModal,
	serviceDeleteDeviceId,
	selectedServicesCount,
	onCloseDeleteServiceModal,
	onConfirmDeleteServices,
	openReportModal,
	reportDeviceId,
	onCloseReportModal,
}) => {
	return (
		<>
			{/* Add/Edit Device Modal */}
			<Dialog open={openModal} onClose={onCloseModal} fullWidth maxWidth="sm">
				<DialogTitle sx={{ m: 0, p: 2 }}>
					{editingDevice
						? `Edit device: ${editingDevice.naziv}`
						: "Add new device"}
					<IconButton
						aria-label="close"
						onClick={onCloseModal}
						sx={{ position: "absolute", right: 8, top: 8 }}
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers>
					{editingDevice ? (
						<EditDevice
							key={formKey}
							device={editingDevice}
							onDeviceUpdated={onDeviceSaved}
						/>
					) : (
						<AddDevice key={formKey} onDeviceAdded={onDeviceSaved} />
					)}
				</DialogContent>
			</Dialog>

			{/* Add Service Modal */}
			<Dialog
				open={openAddServiceModal}
				onClose={onCloseAddServiceModal}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle sx={{ m: 0, p: 2 }}>
					Add service:{" "}
					<strong>
						{addServiceDeviceId
							? devices.find((d) => d.idnaprava === addServiceDeviceId)?.naprava
							: ""}
					</strong>
					<IconButton
						aria-label="close"
						onClick={onCloseAddServiceModal}
						sx={{ position: "absolute", right: 8, top: 8 }}
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers>
					{addServiceDeviceId && (
						<AddService
							deviceId={addServiceDeviceId}
							onServiceAdded={onServiceAdded}
						/>
					)}
				</DialogContent>
			</Dialog>

			{/* Delete Device Confirmation Modal */}
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
						{selectedCount === 1 ? "device" : "devices"}?
					</Typography>
					<Typography variant="body2" color="error" sx={{ mb: 2 }}>
						This action cannot be undone.
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

			{/* Delete Service Confirmation Modal */}
			<Dialog
				open={openDeleteServiceModal}
				onClose={onCloseDeleteServiceModal}
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
					Confirm Service Deletion
					<IconButton
						aria-label="close"
						onClick={onCloseDeleteServiceModal}
						size="small"
						sx={{ color: "inherit" }}
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent sx={{ pt: 2, pb: 2, px: 3, mt: 1 }}>
					<Typography variant="body1" gutterBottom>
						Are you sure you want to delete {selectedServicesCount} selected{" "}
						{selectedServicesCount === 1 ? "service" : "services"}?
					</Typography>
					<Typography variant="body2" color="error" sx={{ mb: 2 }}>
						This action cannot be undone.
					</Typography>
					<Box
						sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}
					>
						<Button variant="outlined" onClick={onCloseDeleteServiceModal}>
							Cancel
						</Button>
						<Button
							variant="contained"
							color="error"
							onClick={onConfirmDeleteServices}
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

export default DeviceModals;
