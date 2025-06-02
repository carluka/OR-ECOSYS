import type React from "react";
import { useState } from "react";
import {
	Box,
	Typography,
	TablePagination,
	Alert,
	CircularProgress,
} from "@mui/material";
import MainLayout from "../layout/MainLayout";
import { useRooms } from "../hooks/useRooms";
import { useRoomFilters } from "../hooks/useRoomFilters";
import { useRoomSelection } from "../hooks/useRoomSelection";
import { RoomHeader } from "../components/rooms/RoomHeader";
import { RoomSummaryCards } from "../components/rooms/RoomSummaryCards";
import { RoomSearchAndActions } from "../components/rooms/RoomSearchAndActions";
import { RoomActionButtons } from "../components/rooms/RoomActionButtons";
import { RoomTable } from "../components/rooms/RoomTable";
import { RoomModals } from "../components/rooms/RoomModals";
import { RoomContextMenu } from "../components/rooms/RoomContextMenu";
import type { RoomStats } from "../types/room.types";

const OperationRooms: React.FC = () => {
	const {
		rooms,
		allDevices,
		loading,
		error,
		loadingCommitIds,
		fetchRooms,
		fetchDevices,
		handleCommit,
		deleteRooms,
		removeDeviceFromRoom,
	} = useRooms();

	const { searchTerm, setSearchTerm, filteredRooms } = useRoomFilters(rooms);

	const {
		selected,
		setSelected,
		isRoomActive,
		anySelectedRoomActive,
		toggleAll,
		toggleOne,
	} = useRoomSelection(filteredRooms);

	const [openRows, setOpenRows] = useState<Record<number, boolean>>({});
	const [loadingRemoving, setLoadingRemoving] = useState<
		Record<number, boolean>
	>({});
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(15);

	// Modal states
	const [openAddRoom, setOpenAddRoom] = useState(false);
	const [openAddDeviceRoom, setOpenAddDeviceRoom] = useState(false);
	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [openReportModal, setOpenReportModal] = useState(false);
	const [reportDeviceId, setReportDeviceId] = useState<number | null>(null);

	// Context menu state
	const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

	// Calculate statistics
	const stats: RoomStats = {
		totalRooms: rooms.length,
		activeRooms: rooms.filter((room) => room.aktivno).length,
		assignedDevices: allDevices.filter((device) => device.soba_idsoba !== null)
			.length,
		unassignedDevices: allDevices.filter(
			(device) => device.soba_idsoba === null
		).length,
		roomsWithUnsavedChanges: rooms.filter((room) => room.unsaved_changes)
			.length,
	};

	// Event handlers
	const handleToggleRow = (id: number) => {
		setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	const handleRemoveDevice = async (deviceId: number, roomId: number) => {
		if (isRoomActive(roomId, rooms)) {
			alert("Cannot remove devices from active rooms.");
			return;
		}

		setLoadingRemoving((prev) => ({ ...prev, [deviceId]: true }));
		try {
			await removeDeviceFromRoom(deviceId);
		} catch (error) {
			alert("Failed to remove device from room.");
		} finally {
			setLoadingRemoving((prev) => ({ ...prev, [deviceId]: false }));
		}
	};

	const handleDelete = () => {
		if (!selected.length) {
			alert("Choose at least one room.");
			return;
		}

		if (anySelectedRoomActive(rooms)) {
			alert("Cannot delete active rooms. Please deselect active rooms.");
			return;
		}

		setOpenDeleteModal(true);
	};

	const confirmDelete = async () => {
		try {
			await deleteRooms(selected);
			setSelected([]);
			setOpenDeleteModal(false);
		} catch (error) {
			alert("Error deleting rooms.");
		}
	};

	const openAddDevice = () => {
		if (selected.length !== 1) {
			alert("Choose exactly one room.");
			return;
		}

		if (isRoomActive(selected[0], rooms)) {
			alert("Cannot add devices to active rooms.");
			return;
		}

		setOpenAddDeviceRoom(true);
	};

	// Pagination handlers
	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setRowsPerPage(Number.parseInt(event.target.value, 10));
		setPage(0);
	};

	// Menu handlers
	const handleMenuOpen = (
		event: React.MouseEvent<HTMLElement>,
		roomId: number
	) => {
		event.stopPropagation();
		setMenuAnchorEl(event.currentTarget);
		setSelectedRoomId(roomId);
	};

	const handleMenuClose = () => {
		setMenuAnchorEl(null);
		setSelectedRoomId(null);
	};

	const handleDeleteRoom = () => {
		if (selectedRoomId) {
			if (isRoomActive(selectedRoomId, rooms)) {
				alert("Cannot delete active rooms.");
				handleMenuClose();
				return;
			}

			setSelected([selectedRoomId]);
			setOpenDeleteModal(true);
		}
		handleMenuClose();
	};

	const handleShowReport = (deviceId: number) => {
		setReportDeviceId(deviceId);
		setOpenReportModal(true);
	};

	// Modal handlers
	const onRoomAdded = () => {
		fetchRooms();
		setOpenAddRoom(false);
	};

	const onDeviceAdded = () => {
		fetchRooms();
		fetchDevices();
		setOpenAddDeviceRoom(false);
	};

	// Paginate rooms for current page
	const paginatedRooms = filteredRooms.slice(
		page * rowsPerPage,
		page * rowsPerPage + rowsPerPage
	);

	if (loading) {
		return (
			<MainLayout>
				<Box
					sx={{
						p: 3,
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						minHeight: "400px",
					}}
				>
					<CircularProgress />
					<Typography sx={{ ml: 2 }}>Loading rooms...</Typography>
				</Box>
			</MainLayout>
		);
	}

	if (error) {
		return (
			<MainLayout>
				<Box sx={{ p: 3 }}>
					<Alert severity="error">{error}</Alert>
				</Box>
			</MainLayout>
		);
	}

	return (
		<MainLayout>
			<RoomHeader />

			<RoomSummaryCards stats={stats} />

			<RoomSearchAndActions
				searchTerm={searchTerm}
				onSearchChange={setSearchTerm}
				onAddRoom={() => setOpenAddRoom(true)}
			/>

			<RoomActionButtons
				selectedCount={selected.length}
				canAddDevices={
					selected.length === 1 && !isRoomActive(selected[0], rooms)
				}
				canDelete={selected.length >= 1 && !anySelectedRoomActive(rooms)}
				onAddDevices={openAddDevice}
				onDelete={handleDelete}
			/>

			<RoomTable
				rooms={paginatedRooms}
				allDevices={allDevices}
				selected={selected}
				openRows={openRows}
				loadingCommitIds={loadingCommitIds}
				loadingRemoving={loadingRemoving}
				onToggleAll={() => toggleAll(rooms)}
				onToggleOne={(id) => toggleOne(id, rooms)}
				onToggleRow={handleToggleRow}
				onCommit={handleCommit}
				onMenuOpen={handleMenuOpen}
				onShowReport={handleShowReport}
				onRemoveDevice={handleRemoveDevice}
				isRoomActive={(roomId) => isRoomActive(roomId, rooms)}
			/>

			<Box
				sx={{
					mt: 2,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<Typography variant="body2" color="text.secondary">
					Showing {paginatedRooms.length} of {filteredRooms.length} rooms
				</Typography>
				<TablePagination
					component="div"
					count={filteredRooms.length}
					page={page}
					onPageChange={handleChangePage}
					rowsPerPage={rowsPerPage}
					onRowsPerPageChange={handleChangeRowsPerPage}
					rowsPerPageOptions={[5, 10, 15, 25]}
				/>
			</Box>

			<RoomModals
				openAddRoom={openAddRoom}
				onCloseAddRoom={() => setOpenAddRoom(false)}
				onRoomAdded={onRoomAdded}
				openAddDeviceRoom={openAddDeviceRoom}
				selectedRoomId={selected[0] || null}
				onCloseAddDeviceRoom={() => setOpenAddDeviceRoom(false)}
				onDeviceAdded={onDeviceAdded}
				openDeleteModal={openDeleteModal}
				selectedCount={selected.length}
				onCloseDeleteModal={() => setOpenDeleteModal(false)}
				onConfirmDelete={confirmDelete}
				openReportModal={openReportModal}
				reportDeviceId={reportDeviceId}
				onCloseReportModal={() => setOpenReportModal(false)}
			/>

			<RoomContextMenu
				anchorEl={menuAnchorEl}
				open={Boolean(menuAnchorEl)}
				selectedRoomId={selectedRoomId}
				isRoomActive={
					selectedRoomId ? isRoomActive(selectedRoomId, rooms) : false
				}
				onClose={handleMenuClose}
				onAddDevices={() => {
					if (selectedRoomId) {
						setSelected([selectedRoomId]);
						setOpenAddDeviceRoom(true);
					}
					handleMenuClose();
				}}
				onDeleteRoom={handleDeleteRoom}
			/>
		</MainLayout>
	);
};

export default OperationRooms;
