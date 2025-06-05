import type React from "react";
import {
	Box,
	Typography,
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Paper,
	Checkbox,
	Button,
	CircularProgress,
	Chip,
} from "@mui/material";
import { Build, Add, Delete, LockOutlined } from "@mui/icons-material";
import type { Service } from "../../types/device.types";

interface DeviceServiceRowProps {
	deviceId: number;
	deviceName: string;
	services: Service[];
	selectedServices: number[];
	loading: boolean;
	isInActiveRoom: boolean;
	onToggleServiceSelection: (serviceId: number) => void;
	onToggleAllServices: () => void;
	onDeleteServices: () => void;
	onAddService: () => void;
}

const DeviceServiceRow: React.FC<DeviceServiceRowProps> = ({
	deviceId,
	deviceName,
	services,
	selectedServices,
	loading,
	isInActiveRoom,
	onToggleServiceSelection,
	onToggleAllServices,
	onDeleteServices,
	onAddService,
}) => {
	return (
		<Box sx={{ margin: 1 }}>
			<Typography
				variant="h6"
				gutterBottom
				component="div"
				sx={{ display: "flex", alignItems: "center" }}
			>
				<Build sx={{ mr: 1 }} />
				Services for {deviceName}
				{isInActiveRoom && (
					<Chip
						label="Active Room"
						size="small"
						color="info"
						sx={{ ml: 2 }}
						icon={<LockOutlined fontSize="small" />}
					/>
				)}
			</Typography>
			{loading ? (
				<Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
					<CircularProgress size={24} />
				</Box>
			) : (
				<>
					<TableContainer component={Paper} variant="outlined">
						<Table size="small">
							<TableHead sx={{ bgcolor: "#f5f5f5" }}>
								<TableRow>
									<TableCell padding="checkbox">
										<Checkbox
											checked={
												services.length > 0 &&
												selectedServices.length === services.length
											}
											indeterminate={
												selectedServices.length > 0 &&
												selectedServices.length < services.length
											}
											onChange={onToggleAllServices}
											disabled={isInActiveRoom}
										/>
									</TableCell>
									<TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
									<TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
									<TableCell sx={{ fontWeight: 600 }}>Comment</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{services.length === 0 ? (
									<TableRow>
										<TableCell colSpan={4} sx={{ textAlign: "center", py: 2 }}>
											No services found.
										</TableCell>
									</TableRow>
								) : (
									services.map((service) => (
										<TableRow key={service.idservis}>
											<TableCell padding="checkbox">
												<Checkbox
													checked={selectedServices.includes(service.idservis)}
													onChange={() =>
														onToggleServiceSelection(service.idservis)
													}
													disabled={isInActiveRoom}
												/>
											</TableCell>
											<TableCell>{service.datum}</TableCell>
											<TableCell>{service.ura}</TableCell>
											<TableCell>{service.komentar}</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</TableContainer>
					<Box
						sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}
					>
						<Button
							variant="outlined"
							color="error"
							onClick={onDeleteServices}
							disabled={!selectedServices.length || isInActiveRoom}
							startIcon={<Delete />}
							size="small"
							sx={{ fontWeight: 500 }}
						>
							Remove Service{selectedServices.length > 1 ? "s" : ""}
						</Button>
						<Button
							variant="contained"
							onClick={onAddService}
							startIcon={<Add />}
							size="small"
							sx={{ fontWeight: 500 }}
							disabled={isInActiveRoom}
						>
							Add Service
						</Button>
					</Box>
				</>
			)}
		</Box>
	);
};

export default DeviceServiceRow;
