import { useState, useEffect } from "react";
import type { RoomWithDeviceCount } from "../types/room.types";

export const useRoomFilters = (rooms: RoomWithDeviceCount[]) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [filteredRooms, setFilteredRooms] = useState<RoomWithDeviceCount[]>([]);

	useEffect(() => {
		const filtered = rooms.filter(
			(room) =>
				room.naziv.toLowerCase().includes(searchTerm.toLowerCase()) ||
				room.lokacija.toLowerCase().includes(searchTerm.toLowerCase()) ||
				room.idsoba.toString().includes(searchTerm)
		);
		setFilteredRooms(filtered);
	}, [searchTerm, rooms]);

	return {
		searchTerm,
		setSearchTerm,
		filteredRooms,
	};
};
