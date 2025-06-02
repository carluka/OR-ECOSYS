import { useState, useEffect } from "react";
import api from "../api";
import type { UserOverview, FullUser, UserType } from "../types/user.types";

export const useUsers = () => {
	const [users, setUsers] = useState<UserOverview[]>([]);
	const [userTypes, setUserTypes] = useState<UserType[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchUsers = () => {
		setLoading(true);
		setError(null);
		api
			.get("/users")
			.then((res) => {
				setUsers(res.data.data);
				setLoading(false);
			})
			.catch((error) => {
				console.error("Error fetching users:", error);
				setError("Error loading user data");
				setLoading(false);
			});
	};

	const fetchUserTypes = () => {
		api
			.get("/userTypes")
			.then((res) => {
				if (Array.isArray(res.data.data)) {
					setUserTypes(res.data.data);
				}
			})
			.catch((error) => {
				console.error("Error fetching user types:", error);
			});
	};

	const deleteUsers = async (ids: number[]): Promise<boolean> => {
		try {
			await api.delete("/users/deleteMultiple", { data: { ids } });
			return true;
		} catch (error) {
			console.error("Error deleting users:", error);
			return false;
		}
	};

	const getUserById = async (id: number): Promise<FullUser | null> => {
		try {
			const response = await api.get<{ data: FullUser }>(`/users/${id}`);
			return response.data.data;
		} catch (error) {
			console.error("Error fetching user:", error);
			return null;
		}
	};

	// Statistics
	const getUserStatistics = () => {
		const adminUsers = users.filter((user) =>
			user.TipUporabnika.naziv.toLowerCase().includes("admin")
		).length;
		const regularUsers = users.length - adminUsers;
		const uniqueUserTypes = [
			...new Set(users.map((user) => user.TipUporabnika.naziv)),
		].length;

		return {
			totalUsers: users.length,
			adminUsers,
			regularUsers,
			uniqueUserTypes,
		};
	};

	useEffect(() => {
		fetchUsers();
		fetchUserTypes();
	}, []);

	return {
		users,
		userTypes,
		loading,
		error,
		fetchUsers,
		fetchUserTypes,
		deleteUsers,
		getUserById,
		getUserStatistics,
	};
};
