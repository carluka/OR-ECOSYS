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
	Chip,
	IconButton,
	Button,
	Tooltip,
	CircularProgress,
} from "@mui/material";
import {
	Devices as DevicesIcon,
	LockOutlined,
	PictureAsPdf,
	Delete,
} from "@mui/icons-material";
import type { Device } from "../../types/room.types";

interface RoomDevicesRowProps {
	roomName: string;
	devices: Device[];
	isActive: boolean;
	loadingRemoving: Record<number, boolean>;
	onShowReport: (deviceId: number) => void;
	onRemoveDevice: (deviceId: number) => void;
}

export const RoomDevicesRow: React.FC<RoomDevicesRowProps> = ({
	roomName,
	devices,
	isActive,
	loadingRemoving,
	onShowReport,
	onRemoveDevice,
}) => {
	return (
		<Box sx={{ margin: 1 }}>
			<Typography
				variant="h6"
				gutterBottom
				component="div"
				sx={{ display: "flex", alignItems: "center" }}
			>
				<DevicesIcon sx={{ mr: 1 }} />
				Devices in {roomName}
				{isActive && (
					<Chip
						label="Active Room"
						size="small"
						color="info"
						sx={{ ml: 2 }}
						icon={<LockOutlined fontSize="small" />}
					/>
				)}
			</Typography>
			<TableContainer component={Paper} variant="outlined">
				<Table size="small">
					<TableHead sx={{ bgcolor: "#f5f5f5" }}>
						<TableRow>
							<TableCell sx={{ fontWeight: 600 }}>Device Name</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Device Type</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{devices.map((device) => (
							<TableRow key={device.idnaprava}>
								<TableCell>
									<Typography variant="body2" fontWeight="medium">
										{device.naprava}
									</Typography>
								</TableCell>
								<TableCell>
									<Chip
										label={device.tip_naprave}
										size="small"
										sx={{
											bgcolor: "action.hover",
											color: "text.primary",
										}}
									/>
								</TableCell>
								<TableCell>
									<Box sx={{ display: "flex", gap: 1 }}>
										<Tooltip title="View Report">
											<IconButton
												size="small"
												color="primary"
												onClick={() => onShowReport(device.idnaprava)}
											>
												<PictureAsPdf fontSize="small" />
											</IconButton>
										</Tooltip>
										<Tooltip
											title={
												isActive
													? "Cannot remove from active room"
													: "Remove from Room"
											}
										>
											<span>
												<Button
													size="small"
													variant="outlined"
													color="error"
													onClick={() => onRemoveDevice(device.idnaprava)}
													disabled={
														isActive || !!loadingRemoving[device.idnaprava]
													}
													startIcon={
														loadingRemoving[device.idnaprava] ? (
															<CircularProgress size={16} />
														) : (
															<Delete fontSize="small" />
														)
													}
												>
													{loadingRemoving[device.idnaprava]
														? "Removing..."
														: "Remove"}
												</Button>
											</span>
										</Tooltip>
									</Box>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
};
