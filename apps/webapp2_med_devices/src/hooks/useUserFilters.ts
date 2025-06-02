import { useState, useEffect } from "react";
import type { UserOverview } from "../types/user.types";

export const useUserFilters = (users: UserOverview[]) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [filterUserType, setFilterUserType] = useState<string>("all");
	const [filteredUsers, setFilteredUsers] = useState<UserOverview[]>(users);

	useEffect(() => {
		let filtered = users.filter(
			(user) =>
				user.ime.toLowerCase().includes(searchTerm.toLowerCase()) ||
				user.priimek.toLowerCase().includes(searchTerm.toLowerCase()) ||
				user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
				user.iduporabnik.toString().includes(searchTerm)
		);

		if (filterUserType !== "all") {
			filtered = filtered.filter(
				(user) => user.TipUporabnika.naziv === filterUserType
			);
		}

		setFilteredUsers(filtered);
	}, [searchTerm, users, filterUserType]);

	return {
		searchTerm,
		setSearchTerm,
		filterUserType,
		setFilterUserType,
		filteredUsers,
	};
};
