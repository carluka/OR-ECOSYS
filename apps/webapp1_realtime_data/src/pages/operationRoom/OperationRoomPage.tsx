import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Box, Typography, useTheme } from "@mui/material";

import PatientSelectionModal from "../../components/PatientSelection/PatientSelectionModal";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import ModuleSelector from "../../components/dashboard/ModuleSelector";
import StartupProgress from "../../components/dashboard/StartupProgress";
import NoDevicesWarning from "../../components/dashboard/NoDeviceWarning";
import DeviceGrid from "../../components/dashboard/DeviceGrid";

import { useFullscreen } from "../../hooks/useFullScreen";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useDeviceData } from "../../hooks/useDeviceData";
import { generateDynamicLayout } from "../../utils/grid-layout";
import {
	ALL_MODULES,
	type DeviceModule,
	type ModuleVisibility,
} from "../../types/device-types";
import type { ModuleLayout, GridPosition } from "../../utils/grid-layout";

import api from "../../api";
import "./OperationRoomPage.css";

const LOADING_DURATION = 35000;

const OperationRoomPageNew: React.FC = () => {
	const { roomId } = useParams();
	const theme = useTheme();
	const containerRef = useRef<HTMLDivElement>(null);

	const [roomName, setRoomName] = useState<string>("Room");
	const [isAvailable, setIsAvailable] = useState(false);
	const [wsUuid, setWsUuid] = useState<string | null>(null);
	const [isActive, setIsActive] = useState(false);

	const [isRunLoading, setIsRunLoading] = useState(false);
	const [isWaitingForModal, setIsWaitingForModal] = useState(false);
	const [isStartupLoading, setIsStartupLoading] = useState(false);
	const [isStopLoading, setIsStopLoading] = useState(false);
	const [startupProgress, setStartupProgress] = useState(0);

	const [availableModules, setAvailableModules] = useState<DeviceModule[]>([]);
	const [moduleLayout, setModuleLayout] = useState<ModuleLayout>({});
	const [moduleVisibility, setModuleVisibility] = useState<ModuleVisibility>(
		{}
	);

	const [showPatientModal, setShowPatientModal] = useState(false);
	const [operationID, setOperationID] = useState<number | null>(null);

	const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
		null
	);
	const loadingTimeoutRef = useRef<number | null>(null);

	const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);
	const { handleMetric, processDeviceData } = useDeviceData();
	const { connected, openSocket, disconnect } = useWebSocket({
		onMessage: handleMetric,
	});

	const {
		nibpData,
		ekgData,
		spo2SensorData,
		capnographData,
		temperatureData,
		infusionPumpData,
		ventilatorData,
	} = processDeviceData();

	const handlePositionChange = (moduleId: string, position: GridPosition) => {
		setModuleLayout((prev) => ({
			...prev,
			[moduleId]: position,
		}));
	};

	const handleVisibilityChange = (moduleId: string, visible: boolean) => {
		setModuleVisibility((prev) => ({
			...prev,
			[moduleId]: visible,
		}));
	};

	const connect = () => {
		wsRef.current?.close();
		const ws = new WebSocket("wss://data.or-ecosystem.eu/ws/medical-device");
		wsRef.current = ws;

		ws.onopen = () => setConnected(true);
		ws.onmessage = (e: MessageEvent) => {
			try {
				const data = JSON.parse(e.data);
				const messages = Array.isArray(data) ? data : [data];
				messages.forEach(handleMetric);
			} catch (err) {
				console.error("Failed to parse message", err);
			}
		};
		ws.onclose = () => {
			setConnected(false);
			wsRef.current = null;
		};
	};

	const connectToWebSocket = async () => {
		if (connected || !wsUuid) return;
		try {
			openSocket(wsUuid);
		} catch (err) {
			console.error("Failed to connect", err);
		}
	};

	const handleMachines = async () => {
		if (isActive) {
			setIsStopLoading(true);
			try {
				await api.post(`/rooms/${roomId}/stopDevices`);
			} catch (err) {
				console.error("Failed to stop devices", err);
			}
			disconnect();
			setIsActive(false);
			setIsAvailable(false);
			setWsUuid(null);
			setIsStopLoading(false);

			setIsRunLoading(false);
			setIsWaitingForModal(false);
			setIsStartupLoading(false);
			setStartupProgress(0);
			if (loadingTimeoutRef.current) {
				clearTimeout(loadingTimeoutRef.current);
			}
			if (progressIntervalRef.current) {
				clearInterval(progressIntervalRef.current);
			}
		} else {
			setIsRunLoading(true);
			setIsWaitingForModal(true);

			try {
				const res = await api.post(`/rooms/${roomId}/startDevices`);
				if (res.data.status === "available" && res.data.wsUuid) {
					setIsAvailable(true);
					setWsUuid(res.data.wsUuid);
					setIsActive(true);
					setShowPatientModal(true);
					setOperationID(res.data.operationID);
				}
			} catch (err) {
				console.error("Failed to deploy devices", err);
				setIsRunLoading(false);
				setIsWaitingForModal(false);
			}
		}
	};

	useEffect(() => {
		const fetchActiveStatus = async () => {
			try {
				const res = await api.get(`/rooms/${roomId}/status`);
				if (res.data && typeof res.data.active === "boolean") {
					setRoomName(res.data.name);
					setIsActive(res.data.active);
					if (res.data.active && res.data.wsUuid) {
						setIsAvailable(true);
						setWsUuid(res.data.wsUuid);
					}

					if (res.data.deviceTypes && Array.isArray(res.data.deviceTypes)) {
						const deviceTypes = res.data.deviceTypes;
						const availableDeviceModules: DeviceModule[] = [];
						const initialVisibility: ModuleVisibility = {};

						deviceTypes.forEach((deviceType: string) => {
							const module = ALL_MODULES.find((m) => m.id === deviceType);
							if (
								module &&
								!availableDeviceModules.find((m) => m.id === deviceType)
							) {
								availableDeviceModules.push(module);
								initialVisibility[deviceType] = true;
							}
						});

						setAvailableModules(availableDeviceModules);
						setModuleVisibility(initialVisibility);

						const dynamicLayout = generateDynamicLayout(availableDeviceModules);
						setModuleLayout(dynamicLayout);
					}
				}
			} catch (err) {
				console.error("Failed to fetch active status", err);
			}
		};

		if (roomId) {
			fetchActiveStatus();
		}
	}, [roomId]);

	useEffect(() => {
		return () => {
			if (loadingTimeoutRef.current) {
				clearTimeout(loadingTimeoutRef.current);
			}
			if (progressIntervalRef.current) {
				clearInterval(progressIntervalRef.current);
			}
		};
	}, []);

	if (!roomId) {
		return <Navigate to="/" replace />;
	}

	const selectedModules = availableModules.filter(
		(m) => moduleVisibility[m.id]
	);
	const isConnectDisabled =
		!isAvailable || connected || isRunLoading || isStartupLoading;

	return (
		<Box
			ref={containerRef}
			sx={{
				position: "relative",
				width: "100%",
				height: isFullscreen ? "100vh" : "100%",
				backgroundColor: theme.palette.grey[50],
				overflow: "hidden",
				...(isFullscreen && {
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					zIndex: 1200,
				}),
			}}
		>
			{isFullscreen && (
				<Box
					sx={{
						position: "absolute",
						top: 16,
						left: "50%",
						transform: "translateX(-50%)",
						bgcolor: "rgba(0,0,0,0.6)",
						borderRadius: 1,
						px: 2,
						py: 1,
						zIndex: 1300,
					}}
				>
					<Typography variant="body2" color="common.white">
						Press F11 or click Exit Fullscreen to return
					</Typography>
				</Box>
			)}

			<Box
				className={`operation-room-content${isFullscreen ? " fullscreen" : ""}`}
				sx={{
					display: "flex",
					flexDirection: "column",
					height: isFullscreen ? "100vh" : "100%",
					...(isFullscreen && {
						maxWidth: "none",
						margin: 0,
						padding: 0,
					}),
				}}
			>
				{!isFullscreen && (
					<DashboardHeader
						roomId={roomId}
						roomName={roomName}
						connected={connected}
						isActive={isActive}
						isRunLoading={isRunLoading}
						isStopLoading={isStopLoading}
						isWaitingForModal={isWaitingForModal}
						isConnectDisabled={isConnectDisabled}
						toggleFullscreen={toggleFullscreen}
						handleMachines={handleMachines}
						connectToWebSocket={connectToWebSocket}
						disconnect={disconnect}
						isFullscreen={isFullscreen}
					/>
				)}

				{isStartupLoading && !isFullscreen && (
					<StartupProgress
						startupProgress={startupProgress}
						loadingDuration={LOADING_DURATION}
					/>
				)}

				{!isFullscreen && availableModules.length > 0 && (
					<ModuleSelector
						availableModules={availableModules}
						moduleVisibility={moduleVisibility}
						handleVisibilityChange={handleVisibilityChange}
						handleResetLayout={handleResetLayout}
					/>
				)}

				{availableModules.length === 0 && !isRunLoading && <NoDevicesWarning />}

				<DeviceGrid
					isFullscreen={isFullscreen}
					moduleVisibility={moduleVisibility}
					availableModules={availableModules}
					moduleLayout={moduleLayout}
					handlePositionChange={handlePositionChange}
					nibpData={nibpData}
					ekgData={ekgData}
					spo2SensorData={spo2SensorData}
					capnographData={capnographData}
					temperatureData={temperatureData}
					infusionPumpData={infusionPumpData}
					ventilatorData={ventilatorData}
				/>
			</Box>

			<PatientSelectionModal
				open={showPatientModal}
				onClose={handlePatientModalClose}
				onPatientSelected={handlePatientSelection}
				operationID={operationID}
			/>
		</Box>
	);
};

export default OperationRoomPageNew;
