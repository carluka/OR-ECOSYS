import { useState } from "react";
import type { UserOverview } from "../types/user.types";

export const useUserSelection = (filteredUsers: UserOverview[]) => {
	const [selected, setSelected] = useState<number[]>([]);

	const toggleAll = () =>
		setSelected((sel) =>
			sel.length === filteredUsers.length
				? []
				: filteredUsers.map((u) => u.iduporabnik)
		);

	const toggleOne = (id: number) =>
		setSelected((sel) =>
			sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]
		);

	return {
		selected,
		setSelected,
		toggleAll,
		toggleOne,
	};
};
