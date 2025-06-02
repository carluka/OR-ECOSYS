import React from "react";
import {
	Paper,
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Checkbox,
	IconButton,
	Box,
	Chip,
	Typography,
	Tooltip,
	Button,
	CircularProgress,
	Collapse,
} from "@mui/material";
import {
	ExpandMore,
	ExpandLess,
	LockOutlined,
	MoreVert,
} from "@mui/icons-material";
import type { RoomWithDeviceCount, Device } from "../../types/room.types";
import { RoomDevicesRow } from "./RoomDevicesRow";

interface RoomTableProps {
	rooms: RoomWithDeviceCount[];
	allDevices: Device[];
	selected: number[];
	openRows: Record<number, boolean>;
	loadingCommitIds: number[];
	loadingRemoving: Record<number, boolean>;
	onToggleAll: () => void;
	onToggleOne: (id: number) => void;
	onToggleRow: (id: number) => void;
	onCommit: (roomId: number) => void;
	onMenuOpen: (event: React.MouseEvent<HTMLElement>, roomId: number) => void;
	onShowReport: (deviceId: number) => void;
	onRemoveDevice: (deviceId: number, roomId: number) => void;
	isRoomActive: (roomId: number) => boolean;
}

export const RoomTable: React.FC<RoomTableProps> = ({
	rooms,
	allDevices,
	selected,
	openRows,
	loadingCommitIds,
	loadingRemoving,
	onToggleAll,
	onToggleOne,
	onToggleRow,
	onCommit,
	onMenuOpen,
	onShowReport,
	onRemoveDevice,
	isRoomActive,
}) => {
	const selectableRooms = rooms.filter((r) => !r.aktivno);

	return (
		<Paper sx={{ overflow: "hidden" }}>
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow sx={{ bgcolor: "grey.50" }}>
							<TableCell padding="checkbox">
								<Checkbox
									indeterminate={
										selected.length > 0 &&
										selected.length < selectableRooms.length
									}
									checked={
										selectableRooms.length > 0 &&
										selected.length === selectableRooms.length
									}
									onChange={onToggleAll}
								/>
							</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Expand</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Room ID</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Room Name</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Device Count</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{rooms.length > 0 ? (
							rooms.map((room) => {
								const devicesInRoom = allDevices.filter(
									(dev) => dev.soba_idsoba === room.idsoba
								);
								const isActive = room.aktivno;

								return (
									<React.Fragment key={room.idsoba}>
										<TableRow
											sx={{
												backgroundColor: isActive
													? "rgba(25, 118, 210, 0.08)"
													: room.unsaved_changes
													? "rgba(255, 179, 71, 0.15)"
													: "inherit",
												"&:hover": {
													backgroundColor: isActive
														? "rgba(25, 118, 210, 0.12)"
														: room.unsaved_changes
														? "rgba(255, 179, 71, 0.25)"
														: "action.hover",
												},
												transition: "background-color 0.2s",
											}}
										>
											<TableCell padding="checkbox">
												<Checkbox
													checked={selected.includes(room.idsoba)}
													onChange={() => onToggleOne(room.idsoba)}
													onClick={(e) => e.stopPropagation()}
													disabled={isActive}
												/>
											</TableCell>
											<TableCell>
												{devicesInRoom.length > 0 ? (
													<IconButton
														size="small"
														onClick={() => onToggleRow(room.idsoba)}
													>
														{openRows[room.idsoba] ? (
															<ExpandLess />
														) : (
															<ExpandMore />
														)}
													</IconButton>
												) : (
													<Box sx={{ width: 40 }} />
												)}
											</TableCell>
											<TableCell>
												<Chip
													label={`#${room.idsoba}`}
													size="small"
													variant="outlined"
													color="primary"
												/>
											</TableCell>
											<TableCell>
												<Box
													sx={{
														display: "flex",
														alignItems: "center",
														gap: 1,
													}}
												>
													<Typography variant="body2" fontWeight="medium">
														{room.naziv}
													</Typography>
													{isActive && (
														<Tooltip title="Active Room - Cannot be modified">
															<LockOutlined fontSize="small" color="info" />
														</Tooltip>
													)}
												</Box>
											</TableCell>
											<TableCell>
												<Typography variant="body2">{room.lokacija}</Typography>
											</TableCell>
											<TableCell>
												<Chip
													label={`${room.st_naprav} devices`}
													size="small"
													color={
														Number.parseInt(room.st_naprav) > 0
															? "success"
															: "default"
													}
													variant="outlined"
												/>
											</TableCell>
											<TableCell>
												{isActive ? (
													<Chip
														label="Active"
														size="small"
														color="info"
														variant="outlined"
													/>
												) : room.unsaved_changes ? (
													<Chip
														label="Pending Changes"
														size="small"
														color="warning"
														variant="outlined"
													/>
												) : (
													<Chip
														label="Saved"
														size="small"
														color="success"
														variant="outlined"
													/>
												)}
											</TableCell>
											<TableCell>
												<Box sx={{ display: "flex", gap: 1 }}>
													{room.unsaved_changes && !isActive && (
														<Tooltip title="Commit Changes">
															<span>
																<Button
																	variant="outlined"
																	color="warning"
																	size="small"
																	onClick={() => onCommit(room.idsoba)}
																	disabled={loadingCommitIds.includes(
																		room.idsoba
																	)}
																	sx={{ minWidth: "auto", px: 1 }}
																>
																	{loadingCommitIds.includes(room.idsoba) ? (
																		<CircularProgress
																			size={16}
																			color="inherit"
																		/>
																	) : (
																		"Commit"
																	)}
																</Button>
															</span>
														</Tooltip>
													)}
													<Tooltip
														title={isActive ? "View Options" : "More Options"}
													>
														<IconButton
															size="small"
															onClick={(e) => onMenuOpen(e, room.idsoba)}
															aria-label="more options"
														>
															<MoreVert fontSize="small" />
														</IconButton>
													</Tooltip>
												</Box>
											</TableCell>
										</TableRow>
										{/* Expanded Devices Row */}
										<TableRow>
											<TableCell
												style={{ paddingBottom: 0, paddingTop: 0 }}
												colSpan={8}
											>
												<Collapse
													in={
														!!openRows[room.idsoba] && devicesInRoom.length > 0
													}
													timeout="auto"
													unmountOnExit
												>
													<RoomDevicesRow
														roomName={room.naziv}
														devices={devicesInRoom}
														isActive={isActive}
														loadingRemoving={loadingRemoving}
														onShowReport={onShowReport}
														onRemoveDevice={(deviceId) =>
															onRemoveDevice(deviceId, room.idsoba)
														}
													/>
												</Collapse>
											</TableCell>
										</TableRow>
									</React.Fragment>
								);
							})
						) : (
							<TableRow>
								<TableCell colSpan={8} sx={{ textAlign: "center", py: 4 }}>
									<Typography variant="body1" color="text.secondary">
										No rooms available.
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
