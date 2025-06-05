import type React from "react";
import {
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Paper,
	Checkbox,
	IconButton,
	Chip,
	Typography,
	Box,
	Tooltip,
	Collapse,
} from "@mui/material";
import {
	ExpandMore,
	ExpandLess,
	PictureAsPdf,
	MoreVert,
	LockOutlined,
} from "@mui/icons-material";
import type { DeviceOverview } from "../../types/device.types";
import DeviceServiceRow from "./DeviceServiceRow";

interface DeviceTableProps {
	devices: DeviceOverview[];
	selected: number[];
	expandedDevices: Set<number>;
	deviceServices: Record<number, any[]>;
	selectedServices: Record<number, number[]>;
	loadingServices: Set<number>;
	onToggleAll: () => void;
	onToggleOne: (id: number) => void;
	onToggleExpand: (deviceId: number) => void;
	onShowReport: (deviceId: number) => void;
	onMenuOpen: (event: React.MouseEvent<HTMLElement>, deviceId: number) => void;
	onToggleServiceSelection: (deviceId: number, serviceId: number) => void;
	onToggleAllServices: (deviceId: number) => void;
	onDeleteServices: (deviceId: number) => void;
	onAddService: (deviceId: number) => void;
	isDeviceInActiveRoom: (device: DeviceOverview) => boolean;
}

const DeviceTable: React.FC<DeviceTableProps> = ({
	devices,
	selected,
	expandedDevices,
	deviceServices,
	selectedServices,
	loadingServices,
	onToggleAll,
	onToggleOne,
	onToggleExpand,
	onShowReport,
	onMenuOpen,
	onToggleServiceSelection,
	onToggleAllServices,
	onDeleteServices,
	onAddService,
	isDeviceInActiveRoom,
}) => {
	return (
		<Paper sx={{ overflow: "hidden" }}>
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow sx={{ bgcolor: "grey.50" }}>
							<TableCell padding="checkbox">
								<Checkbox
									indeterminate={
										selected.length > 0 && selected.length < devices.length
									}
									checked={
										devices.length > 0 && selected.length === devices.length
									}
									onChange={onToggleAll}
								/>
							</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Expand</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Device ID</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Device Name</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Device Type</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Room Name</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Service Status</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{devices.length > 0 ? (
							devices.map((device) => {
								const isInActiveRoom = isDeviceInActiveRoom(device);

								return (
									<>
										<TableRow
											key={device.idnaprava}
											sx={{
												backgroundColor: isInActiveRoom
													? "rgba(25, 118, 210, 0.08)"
													: "inherit",
												"&:hover": {
													backgroundColor: isInActiveRoom
														? "rgba(25, 118, 210, 0.12)"
														: "action.hover",
												},
												transition: "background-color 0.2s",
											}}
										>
											<TableCell padding="checkbox">
												<Checkbox
													checked={selected.includes(device.idnaprava)}
													onChange={() => onToggleOne(device.idnaprava)}
													onClick={(e) => e.stopPropagation()}
													disabled={isInActiveRoom}
												/>
											</TableCell>
											<TableCell>
												<IconButton
													size="small"
													onClick={() => onToggleExpand(device.idnaprava)}
												>
													{expandedDevices.has(device.idnaprava) ? (
														<ExpandLess />
													) : (
														<ExpandMore />
													)}
												</IconButton>
											</TableCell>
											<TableCell>
												<Chip
													label={`#${device.idnaprava}`}
													size="small"
													variant="outlined"
													color="primary"
												/>
											</TableCell>
											<TableCell>
												<Box
													sx={{ display: "flex", alignItems: "center", gap: 1 }}
												>
													<Typography variant="body2" fontWeight="medium">
														{device.naprava}
													</Typography>
													{isInActiveRoom && (
														<Tooltip title="Device in Active Room - Cannot be modified">
															<LockOutlined fontSize="small" color="info" />
														</Tooltip>
													)}
												</Box>
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
												{device.soba === "NO ROOM" ? (
													<Chip
														label="NO ROOM"
														size="small"
														color="error"
														variant="outlined"
													/>
												) : (
													<Box
														sx={{
															display: "flex",
															alignItems: "center",
															gap: 1,
														}}
													>
														<Typography variant="body2">
															{device.soba_naziv}
														</Typography>
														{isInActiveRoom && (
															<Chip
																label="Active"
																size="small"
																color="info"
																variant="outlined"
															/>
														)}
													</Box>
												)}
											</TableCell>
											<TableCell>
												{device.soba === "NO ROOM" ? (
													<Chip
														label="NO ROOM"
														size="small"
														color="error"
														variant="outlined"
													/>
												) : (
													<Typography variant="body2">
														{device.soba_lokacija}
													</Typography>
												)}
											</TableCell>
											<TableCell>
												<Chip
													label={device.servis ? "Serviced" : "Unserviced"}
													size="small"
													color={device.servis ? "success" : "warning"}
													variant="outlined"
												/>
											</TableCell>
											<TableCell>
												<Box sx={{ display: "flex", gap: 1 }}>
													<Tooltip title="View Report">
														<IconButton
															size="small"
															color="primary"
															onClick={(e) => {
																e.stopPropagation();
																onShowReport(device.idnaprava);
															}}
														>
															<PictureAsPdf fontSize="small" />
														</IconButton>
													</Tooltip>
													<Tooltip
														title={
															isInActiveRoom ? "View Options" : "More Options"
														}
													>
														<IconButton
															size="small"
															onClick={(e) => onMenuOpen(e, device.idnaprava)}
															aria-label="more options"
														>
															<MoreVert fontSize="small" />
														</IconButton>
													</Tooltip>
												</Box>
											</TableCell>
										</TableRow>
										{/* Expanded Services Row */}
										<TableRow>
											<TableCell
												style={{ paddingBottom: 0, paddingTop: 0 }}
												colSpan={9}
											>
												<Collapse
													in={expandedDevices.has(device.idnaprava)}
													timeout="auto"
													unmountOnExit
												>
													<DeviceServiceRow
														deviceId={device.idnaprava}
														deviceName={device.naprava}
														services={deviceServices[device.idnaprava] || []}
														selectedServices={
															selectedServices[device.idnaprava] || []
														}
														loading={loadingServices.has(device.idnaprava)}
														isInActiveRoom={isInActiveRoom}
														onToggleServiceSelection={(serviceId) =>
															onToggleServiceSelection(
																device.idnaprava,
																serviceId
															)
														}
														onToggleAllServices={() =>
															onToggleAllServices(device.idnaprava)
														}
														onDeleteServices={() =>
															onDeleteServices(device.idnaprava)
														}
														onAddService={() => onAddService(device.idnaprava)}
													/>
												</Collapse>
											</TableCell>
										</TableRow>
									</>
								);
							})
						) : (
							<TableRow>
								<TableCell colSpan={9} sx={{ textAlign: "center", py: 4 }}>
									<Typography variant="body1" color="text.secondary">
										No devices available.
									</Typography>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>
		</Paper>
	);
};

export default DeviceTable;
