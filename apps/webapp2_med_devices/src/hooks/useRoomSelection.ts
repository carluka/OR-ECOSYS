import { useState } from "react";
import type { RoomWithDeviceCount } from "../types/room.types";

export const useRoomSelection = (filteredRooms: RoomWithDeviceCount[]) => {
	const [selected, setSelected] = useState<number[]>([]);

	const isRoomActive = (
		roomId: number,
		rooms: RoomWithDeviceCount[]
	): boolean => {
		const room = rooms.find((r) => r.idsoba === roomId);
		return room?.aktivno || false;
	};

	const anySelectedRoomActive = (rooms: RoomWithDeviceCount[]): boolean => {
		return selected.some((roomId) => isRoomActive(roomId, rooms));
	};

	const toggleAll = (rooms: RoomWithDeviceCount[]) => {
		if (selected.length === filteredRooms.length) {
			setSelected([]);
		} else {
			const selectableRooms = filteredRooms
				.filter((room) => !room.aktivno)
				.map((r) => r.idsoba);
			setSelected(selectableRooms);
		}
	};

	const toggleOne = (id: number, rooms: RoomWithDeviceCount[]) => {
		if (isRoomActive(id, rooms)) return;

		setSelected((sel) =>
			sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]
		);
	};

	return {
		selected,
		setSelected,
		isRoomActive,
		anySelectedRoomActive,
		toggleAll,
		toggleOne,
	};
};
