import type React from "react";
import { useState } from "react";
import { Box, Button, Typography, TablePagination, Alert } from "@mui/material";
import MainLayout from "../layout/MainLayout";
import api from "../api";

// Components
import DeviceHeader from "../components/devices/DeviceHeader";
import DeviceSummaryCards from "../components/devices/DeviceSummaryCards";
import DeviceFilters from "../components/devices/DeviceFilters";
import DeviceTable from "../components/devices/DeviceTable";
import DeviceModals from "../components/devices/DeviceModals";
import DeviceContextMenu from "../components/devices/DeviceContextMenu";

// Hooks
import { useDevices } from "../hooks/useDevices";
import { useDeviceServices } from "../hooks/useDeviceServices";

// Types
import type { FullDevice } from "../types/device.types";

const Devices: React.FC = () => {
	const {
		devices,
		filteredDevices,
		tipiNaprave,
		loading,
		error,
		filterType,
		setFilterType,
		filterServis,
		setFilterServis,
		filterActiveRoom,
		setFilterActiveRoom,
		searchTerm,
		setSearchTerm,
		fetchDevices,
		isDeviceInActiveRoom,
		anySelectedDeviceInActiveRoom,
	} = useDevices();

	const {
		deviceServices,
		loadingServices,
		selectedServices,
		fetchDeviceServices,
		toggleServiceSelection,
		toggleAllServices,
		clearSelectedServices,
	} = useDeviceServices();

	// Device selection state
	const [selected, setSelected] = useState<number[]>([]);
	const [expandedDevices, setExpandedDevices] = useState<Set<number>>(
		new Set()
	);

	// Modal states
	const [openModal, setOpenModal] = useState(false);
	const [formKey, setFormKey] = useState(0);
	const [editingDevice, setEditingDevice] = useState<FullDevice | null>(null);
	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [openAddServiceModal, setOpenAddServiceModal] = useState(false);
	const [addServiceDeviceId, setAddServiceDeviceId] = useState<number | null>(
		null
	);
	const [openDeleteServiceModal, setOpenDeleteServiceModal] = useState(false);
	const [serviceDeleteDeviceId, setServiceDeleteDeviceId] = useState<
		number | null
	>(null);
	const [openReportModal, setOpenReportModal] = useState(false);
	const [reportDeviceId, setReportDeviceId] = useState<number | null>(null);

	// Context menu state
	const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);

	// Pagination state
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(15);

	// Selection handlers
	const toggleAll = () => {
		// Only allow selecting devices that are not in active rooms
		const selectableDevices = filteredDevices.filter(
			(device) => !isDeviceInActiveRoom(device)
		);

		if (selected.length === selectableDevices.length) {
			setSelected([]);
		} else {
			setSelected(selectableDevices.map((d) => d.idnaprava));
		}
	};

	const toggleOne = (id: number) => {
		// Don't allow selecting devices in active rooms
		const device = devices.find((d) => d.idnaprava === id);
		if (device && isDeviceInActiveRoom(device)) {
			console.log(`Cannot select device ${id} - it's in an active room`);
			return;
		}

		setSelected((sel) =>
			sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]
		);
	};

	// Expand/collapse handlers
	const toggleExpand = (deviceId: number) => {
		const newExpanded = new Set(expandedDevices);
		if (newExpanded.has(deviceId)) {
			newExpanded.delete(deviceId);
		} else {
			newExpanded.add(deviceId);
			if (!deviceServices[deviceId]) {
				fetchDeviceServices(deviceId);
			}
		}
		setExpandedDevices(newExpanded);
	};

	// Device CRUD operations
	const handleDelete = () => {
		if (!selected.length) return alert("Choose at least one device.");

		// Check if any selected device is in an active room
		if (anySelectedDeviceInActiveRoom(selected)) {
			alert(
				"Cannot delete devices that are in active rooms. Please deselect devices in active rooms."
			);
			return;
		}

		setOpenDeleteModal(true);
	};

	const confirmDelete = () => {
		api
			.delete("/devices/deleteMultiple", { data: { ids: selected } })
			.then(() => {
				setSelected([]);
				fetchDevices();
				setOpenDeleteModal(false);
			})
			.catch(console.error);
	};

	const openAdd = () => {
		setEditingDevice(null);
		setFormKey((k) => k + 1);
		setOpenModal(true);
	};

	const closeModal = () => {
		setOpenModal(false);
		setEditingDevice(null);
	};

	const handleSaved = () => {
		fetchDevices();
		setSelected([]);
		closeModal();
	};

	// Service operations
	const handleDeleteServices = (deviceId: number) => {
		const device = devices.find((d) => d.idnaprava === deviceId);
		if (device && isDeviceInActiveRoom(device)) {
			alert("Cannot delete services for devices in active rooms.");
			return;
		}

		const serviceIds = selectedServices[deviceId] || [];
		if (!serviceIds.length) {
			alert("Choose at least one service.");
			return;
		}
		setServiceDeleteDeviceId(deviceId);
		setOpenDeleteServiceModal(true);
	};

	const confirmDeleteServices = () => {
		if (!serviceDeleteDeviceId) return;

		const serviceIds = selectedServices[serviceDeleteDeviceId] || [];
		api
			.delete("/services/deleteMultiple", { data: { ids: serviceIds } })
			.then(() => {
				fetchDeviceServices(serviceDeleteDeviceId);
				clearSelectedServices(serviceDeleteDeviceId);
				fetchDevices();
				setOpenDeleteServiceModal(false);
			})
			.catch(console.error);
	};

	const handleAddService = (deviceId: number) => {
		const device = devices.find((d) => d.idnaprava === deviceId);
		if (device && isDeviceInActiveRoom(device)) {
			alert("Cannot add services to devices in active rooms.");
			return;
		}

		setAddServiceDeviceId(deviceId);
		setOpenAddServiceModal(true);
	};

	const handleServiceAdded = () => {
		if (addServiceDeviceId) {
			fetchDeviceServices(addServiceDeviceId);
			fetchDevices();
		}
		setOpenAddServiceModal(false);
		setAddServiceDeviceId(null);
	};

	// Report operations
	const handleShowReport = (deviceId: number) => {
		setReportDeviceId(deviceId);
		setOpenReportModal(true);
	};

	// Context menu handlers
	const handleMenuOpen = (
		event: React.MouseEvent<HTMLElement>,
		deviceId: number
	) => {
		event.stopPropagation();
		setMenuAnchorEl(event.currentTarget);
		setSelectedDeviceId(deviceId);
	};

	const handleMenuClose = () => {
		setMenuAnchorEl(null);
		setSelectedDeviceId(null);
	};

	const handleEditDevice = () => {
		if (selectedDeviceId) {
			const device = devices.find((d) => d.idnaprava === selectedDeviceId);
			if (device && isDeviceInActiveRoom(device)) {
				alert("Cannot edit devices that are in active rooms.");
				handleMenuClose();
				return;
			}

			api
				.get<{ data: FullDevice }>(`/devices/${selectedDeviceId}`)
				.then((res) => {
					setEditingDevice(res.data.data);
					setFormKey((k) => k + 1);
					setOpenModal(true);
				})
				.catch((err) => {
					console.error("Error fetching device:", err);
					alert("Error loading data for device.");
				});
		}
		handleMenuClose();
	};

	const handleDeleteDevice = () => {
		if (selectedDeviceId) {
			const device = devices.find((d) => d.idnaprava === selectedDeviceId);
			if (device && isDeviceInActiveRoom(device)) {
				alert("Cannot delete devices that are in active rooms.");
				handleMenuClose();
				return;
			}

			setSelected([selectedDeviceId]);
			setOpenDeleteModal(true);
		}
		handleMenuClose();
	};

	const handleViewReport = () => {
		if (selectedDeviceId) {
			handleShowReport(selectedDeviceId);
		}
		handleMenuClose();
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

	// Paginated devices
	const paginatedDevices = filteredDevices.slice(
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
					<Typography sx={{ ml: 2 }}>Loading devices...</Typography>
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
			<DeviceHeader />

			<DeviceSummaryCards devices={devices} />

			<DeviceFilters
				searchTerm={searchTerm}
				setSearchTerm={setSearchTerm}
				filterType={filterType}
				setFilterType={setFilterType}
				filterServis={filterServis}
				setFilterServis={setFilterServis}
				filterActiveRoom={filterActiveRoom}
				setFilterActiveRoom={setFilterActiveRoom}
				tipiNaprave={tipiNaprave}
				onAddDevice={openAdd}
			/>

			{/* Action Buttons */}
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
					color="error"
					onClick={handleDelete}
					disabled={selected.length < 1}
				>
					Remove Device{selected.length > 1 ? "s" : ""}
				</Button>
			</Box>

			<DeviceTable
				devices={paginatedDevices}
				selected={selected}
				expandedDevices={expandedDevices}
				deviceServices={deviceServices}
				selectedServices={selectedServices}
				loadingServices={loadingServices}
				onToggleAll={toggleAll}
				onToggleOne={toggleOne}
				onToggleExpand={toggleExpand}
				onShowReport={handleShowReport}
				onMenuOpen={handleMenuOpen}
				onToggleServiceSelection={toggleServiceSelection}
				onToggleAllServices={toggleAllServices}
				onDeleteServices={handleDeleteServices}
				onAddService={handleAddService}
				isDeviceInActiveRoom={isDeviceInActiveRoom}
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
					Showing {paginatedDevices.length} of {filteredDevices.length} devices
				</Typography>
				<TablePagination
					component="div"
					count={filteredDevices.length}
					page={page}
					onPageChange={handleChangePage}
					rowsPerPage={rowsPerPage}
					onRowsPerPageChange={handleChangeRowsPerPage}
					rowsPerPageOptions={[5, 10, 15, 25]}
				/>
			</Box>

			<DeviceModals
				openModal={openModal}
				editingDevice={editingDevice}
				formKey={formKey}
				onCloseModal={closeModal}
				onDeviceSaved={handleSaved}
				openAddServiceModal={openAddServiceModal}
				addServiceDeviceId={addServiceDeviceId}
				devices={devices}
				onCloseAddServiceModal={() => setOpenAddServiceModal(false)}
				onServiceAdded={handleServiceAdded}
				openDeleteModal={openDeleteModal}
				selectedCount={selected.length}
				onCloseDeleteModal={() => setOpenDeleteModal(false)}
				onConfirmDelete={confirmDelete}
				openDeleteServiceModal={openDeleteServiceModal}
				serviceDeleteDeviceId={serviceDeleteDeviceId}
				selectedServicesCount={
					serviceDeleteDeviceId
						? selectedServices[serviceDeleteDeviceId]?.length || 0
						: 0
				}
				onCloseDeleteServiceModal={() => setOpenDeleteServiceModal(false)}
				onConfirmDeleteServices={confirmDeleteServices}
				openReportModal={openReportModal}
				reportDeviceId={reportDeviceId}
				onCloseReportModal={() => setOpenReportModal(false)}
			/>

			<DeviceContextMenu
				anchorEl={menuAnchorEl}
				open={Boolean(menuAnchorEl)}
				isDeviceInActiveRoom={
					selectedDeviceId
						? (() => {
								const device = devices.find(
									(d) => d.idnaprava === selectedDeviceId
								);
								return device ? isDeviceInActiveRoom(device) : false;
						  })()
						: false
				}
				onClose={handleMenuClose}
				onViewReport={handleViewReport}
				onEditDevice={handleEditDevice}
				onDeleteDevice={handleDeleteDevice}
			/>
		</MainLayout>
	);
};

export default Devices;
