import { useState, useEffect } from "react";
import api from "../api";
import type { DeviceOverview, DeviceType } from "../types/device.types";

export const useDevices = () => {
	const [devices, setDevices] = useState<DeviceOverview[]>([]);
	const [filteredDevices, setFilteredDevices] = useState<DeviceOverview[]>([]);
	const [tipiNaprave, setTipiNaprave] = useState<DeviceType[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [filterType, setFilterType] = useState<string>("all");
	const [filterServis, setFilterServis] = useState<"all" | "yes" | "no">("all");
	const [searchTerm, setSearchTerm] = useState("");

	const fetchDevices = () => {
		setLoading(true);
		setError(null);
		const params: Record<string, any> = {};
		if (filterType !== "all") params.tip_naprave = filterType;
		if (filterServis !== "all") params.servis = filterServis === "yes";

		api
			.get("/devices/prikaz", { params })
			.then((res) => {
				setDevices(res.data.data);
				setFilteredDevices(res.data.data);
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
				}
			})
			.catch((error) => {
				console.error("Error fetching device types:", error);
			});
	};

	useEffect(() => {
		fetchDevices();
	}, [filterType, filterServis]);

	useEffect(() => {
		fetchDeviceTypes();
	}, []);

	useEffect(() => {
		const filtered = devices.filter(
			(device) =>
				device.naprava.toLowerCase().includes(searchTerm.toLowerCase()) ||
				device.tip_naprave.toLowerCase().includes(searchTerm.toLowerCase()) ||
				device.soba.toLowerCase().includes(searchTerm.toLowerCase()) ||
				device.idnaprava.toString().includes(searchTerm)
		);
		setFilteredDevices(filtered);
	}, [searchTerm, devices]);

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
		searchTerm,
		setSearchTerm,
		fetchDevices,
	};
};
