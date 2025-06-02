import { useState } from "react";
import api from "../api";
import type { Service } from "../types/device.types";

export const useDeviceServices = () => {
	const [deviceServices, setDeviceServices] = useState<
		Record<number, Service[]>
	>({});
	const [loadingServices, setLoadingServices] = useState<Set<number>>(
		new Set()
	);
	const [selectedServices, setSelectedServices] = useState<
		Record<number, number[]>
	>({});

	const fetchDeviceServices = async (deviceId: number) => {
		setLoadingServices((prev) => new Set(prev).add(deviceId));
		try {
			const response = await api.get(`/services/device/${deviceId}`);
			const services = response.data.data.sort((a: Service, b: Service) => {
				return new Date(b.datum).getTime() - new Date(a.datum).getTime();
			});
			setDeviceServices((prev) => ({ ...prev, [deviceId]: services }));
		} catch (error) {
			console.error("Error fetching services:", error);
		} finally {
			setLoadingServices((prev) => {
				const newSet = new Set(prev);
				newSet.delete(deviceId);
				return newSet;
			});
		}
	};

	const toggleServiceSelection = (deviceId: number, serviceId: number) => {
		setSelectedServices((prev) => {
			const deviceSelections = prev[deviceId] || [];
			const newSelections = deviceSelections.includes(serviceId)
				? deviceSelections.filter((id) => id !== serviceId)
				: [...deviceSelections, serviceId];
			return { ...prev, [deviceId]: newSelections };
		});
	};

	const toggleAllServices = (deviceId: number) => {
		const services = deviceServices[deviceId] || [];
		const currentSelections = selectedServices[deviceId] || [];
		const newSelections =
			currentSelections.length === services.length
				? []
				: services.map((s) => s.idservis);
		setSelectedServices((prev) => ({ ...prev, [deviceId]: newSelections }));
	};

	const clearSelectedServices = (deviceId: number) => {
		setSelectedServices((prev) => ({ ...prev, [deviceId]: [] }));
	};

	return {
		deviceServices,
		loadingServices,
		selectedServices,
		fetchDeviceServices,
		toggleServiceSelection,
		toggleAllServices,
		clearSelectedServices,
	};
};
