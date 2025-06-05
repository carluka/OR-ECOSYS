import { useState, useEffect } from "react";
import api from "../api";
import type { DeviceOverview, DeviceType } from "../types/device.types";

export const useDevices = () => {
	const [devices, setDevices] = useState<DeviceOverview[]>([]);
	const [activeRooms, setActiveRooms] = useState<Set<number>>(new Set());
	const [tipiNaprave, setTipiNaprave] = useState<DeviceType[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filterType, setFilterType] = useState<string>("all");
	const [filterServis, setFilterServis] = useState<"all" | "yes" | "no">("all");
	const [filterActiveRoom, setFilterActiveRoom] = useState<
		"all" | "active" | "inactive"
	>("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [filteredDevices, setFilteredDevices] = useState<DeviceOverview[]>([]);

	const fetchActiveRooms = () => {
		api
			.get("/rooms/roomsDeviceCount")
			.then((res) => {
				if (Array.isArray(res.data.data)) {
					const activeRoomIds = new Set<number>(
						res.data.data
							.filter((room: any) => room.aktivno)
							.map((room: any) => Number(room.idsoba))
					);
					setActiveRooms(activeRoomIds);
				}
			})
			.catch((error) => {
				console.error("Error fetching active rooms:", error);
			});
	};

	const fetchDevices = () => {
		setLoading(true);
		setError(null);
		const params: Record<string, any> = {};
		if (filterType !== "all") params.tip_naprave = filterType;
		if (filterServis !== "all") params.servis = filterServis === "yes";

		api
			.get("/devices/prikaz", { params })
			.then((res) => {
				console.log("Devices data:", res.data.data);
				setDevices(res.data.data);
				setLoading(false);
			})
			.catch((error) => {
				console.error("Error fetching devices:", error);
				setError("Error loading device data");
				setLoading(false);
			});
	};

	const fetchDeviceTypes = () => {
		api
			.get("/deviceType")
			.then((response) => {
				if (Array.isArray(response.data.data)) {
					setTipiNaprave(response.data.data);
				} else {
					console.error("API response is not an array:", response.data);
				}
			})
			.catch((error) => {
				console.error("Error fetching device types:", error);
			});
	};

	// Check if a device is in an active room
	const isDeviceInActiveRoom = (device: DeviceOverview): boolean => {
		// If device has no room or is in "NO ROOM", it's not in an active room
		if (device.soba === "NO ROOM" || !device.soba_idsoba) {
			return false;
		}

		// Check if the device's room ID is in the set of active rooms
		const isActive = activeRooms.has(device.soba_idsoba);
		return isActive;
	};

	// Check if any selected device is in an active room
	const anySelectedDeviceInActiveRoom = (selectedIds: number[]): boolean => {
		return selectedIds.some((deviceId) => {
			const device = devices.find((d) => d.idnaprava === deviceId);
			return device ? isDeviceInActiveRoom(device) : false;
		});
	};

	useEffect(() => {
		fetchDevices();
		fetchActiveRooms();
	}, [filterType, filterServis]);

	useEffect(() => {
		fetchDeviceTypes();
	}, []);

	useEffect(() => {
		let filtered = devices.filter(
			(device) =>
				device.naprava.toLowerCase().includes(searchTerm.toLowerCase()) ||
				device.tip_naprave.toLowerCase().includes(searchTerm.toLowerCase()) ||
				device.soba.toLowerCase().includes(searchTerm.toLowerCase()) ||
				device.idnaprava.toString().includes(searchTerm)
		);

		// Apply active room filter
		if (filterActiveRoom === "active") {
			filtered = filtered.filter((device) => isDeviceInActiveRoom(device));
		} else if (filterActiveRoom === "inactive") {
			filtered = filtered.filter((device) => !isDeviceInActiveRoom(device));
		}

		setFilteredDevices(filtered);
	}, [searchTerm, devices, filterActiveRoom, activeRooms]);

	return {
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
		activeRooms,
	};
};
