import { useState, useEffect } from "react";
import api from "../api";
import type { RoomWithDeviceCount, Device } from "../types/room.types";

export const useRooms = () => {
	const [rooms, setRooms] = useState<RoomWithDeviceCount[]>([]);
	const [allDevices, setAllDevices] = useState<Device[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [loadingCommitIds, setLoadingCommitIds] = useState<number[]>([]);

	const fetchRooms = () => {
		setLoading(true);
		setError(null);
		api
			.get("/rooms/roomsDeviceCount")
			.then((res) => {
				if (Array.isArray(res.data.data)) {
					setRooms(res.data.data);
					setLoading(false);
				} else {
					console.error("API response data is not an array:", res.data);
					setError("Invalid data format received");
					setLoading(false);
				}
			})
			.catch((error) => {
				console.error("Error fetching rooms:", error);
				setError("Error loading room data");
				setLoading(false);
			});
	};

	const fetchDevices = () => {
		api
			.get("/devices/prikaz")
			.then((res) => {
				if (Array.isArray(res.data.data)) {
					setAllDevices(res.data.data);
				} else {
					console.error("Devices response is not array:", res.data);
				}
			})
			.catch(console.error);
	};

	const handleCommit = async (roomId: number) => {
		const room = rooms.find((r) => r.idsoba === roomId);
		if (room?.aktivno) {
			alert("Cannot commit changes to active rooms.");
			return;
		}

		setLoadingCommitIds((prev) => [...prev, roomId]);
		try {
			await api.post("/rooms/commitChanges", { id: roomId });
			await fetchRooms();
		} catch (err) {
			console.error("Error committing changes for room:", err);
			alert("Failed to commit changes.");
		} finally {
			setLoadingCommitIds((prev) => prev.filter((id) => id !== roomId));
		}
	};

	const deleteRooms = async (roomIds: number[]) => {
		try {
			await api.delete("/rooms/deleteMultiple", { data: { ids: roomIds } });
			await fetchRooms();
		} catch (err) {
			console.error("Error deleting rooms:", err);
			throw new Error("Error deleting rooms.");
		}
	};

	const removeDeviceFromRoom = async (deviceId: number) => {
		try {
			await api.put(`/devices/${deviceId}`, { soba_idsoba: null });
			await fetchDevices();
			await fetchRooms();
		} catch (error) {
			console.error("Error removing device from room", error);
			throw new Error("Failed to remove device from room.");
		}
	};

	useEffect(() => {
		fetchRooms();
		fetchDevices();
	}, []);

	return {
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
	};
};
