import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
	Box,
	Typography,
	Paper,
	Alert,
	CircularProgress,
	Checkbox,
	Button,
	Chip,
	Stack,
	Card,
	CardContent,
	Divider,
} from "@mui/material";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	CartesianGrid,
} from "recharts";
import {
	Visibility,
	VisibilityOff,
	SelectAll,
	ClearAll,
	BarChart as BarChartIcon,
	ShowChart,
} from "@mui/icons-material";
import api from "../../api";

interface MeasurementPoint {
	time: string;
	value: number;
}

interface MeasurementGroup {
	label: string;
	deviceId: string;
	field: string;
	unit: string;
	data: MeasurementPoint[];
}

interface Device {
	deviceName: string;
	displayName: string;
	metrics: MeasurementGroup[];
	totalMeasurements: number;
}

interface OperationData {
	idoperacija: number;
	datum: string;
	cas_zacetka: string;
	cas_konca: string;
	Pacient: {
		ime: string;
		priimek: string;
		datum_rojstva: string;
	};
	Soba: {
		naziv: string;
		lokacija: string;
	};
	meritve: MeasurementGroup[];
}

const OperationDetailsPage = () => {
	const { id } = useParams();
	const [operation, setOperation] = useState<OperationData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [selectedDevices, setSelectedDevices] = useState<Set<string>>(
		new Set()
	);
	const [availableDevices, setAvailableDevices] = useState<Device[]>([]);

	const extractDeviceName = (deviceId: string): string => {
		const parts = deviceId.split(".");
		return parts[parts.length - 1];
	};

	const getDeviceDisplayName = (deviceName: string): string => {
		const deviceMappings: { [key: string]: string } = {
			nibp_module: "NIBP Monitor (Blood Pressure)",
			capnograph: "Capnograph (CO2)",
			ecg_module: "ECG Monitor",
			pulse_oximeter: "Pulse Oximeter (SpO2)",
			temperature_sensor: "Temperature Sensor",
			mechanical_ventilator: "Mechanical Ventilator",
			infusion_pump: "Infusion Pump",
		};

		return deviceMappings[deviceName] || deviceName;
	};

 const getProperUnit = (group: MeasurementGroup): string => {
  const f = group.field.toLowerCase();

    // NIBP 
  if (
    f.includes("metrics_bps.ch0.nibp_module") || 
    f.includes("metrics_bpd.ch0.nibp_module") ||
    f.includes("metrics_bpa.ch0.nibp_module")   
  ) {
    return "mmHg";
  }

  // Capnograph 
  if (f.includes("metrics_co2.ch0.capnograph")) {
    return "mmHg";  
  }
  if (f.includes("metrics_rf.ch0.capnograph")) {
    return "bpm";   
  }

  // ECG 
  if (f.includes("metrics_heartrate.ch0.ecg_module")) {
    return "bpm";   
  }
  if (
    f.includes("metrics_rrinterval.ch0.ecg_module") || 
    f.includes("metrics_qrsduration.ch0.ecg_module")   
  ) {
    return "ms";
  }

  // Spo2 
  if (f.includes("metrics_oxygen_saturation.ch0.spo2")) {
    return "%";
  }

  // Temperature
  if (f.includes("metrics_temperature.ch0.temperature_gauge")) {
    return "°C";
  }

  // Infusion Pump 
  if (f.includes("metrics_flowrate.ch0.infusion_pump")) {
    return "mL/h";  
  }
  if (f.includes("metrics_volumetotal.ch0.infusion_pump")) {
    return "mL"; 
  }

  // Mechanical Ventilator 
  if (f.includes("metrics_vol.ch0.mechanical_ventilator")) {
    return "mL";  
  }
  if (f.includes("metrics_rf.ch0.mechanical_ventilator")) {
    return "bpm";   
  }
  if (
    f.includes("metrics_ox_con.ch0.mechanical_ventilator") || 
    f.includes("metrics_ox_con") 
  ) {
    return "%";
  }
  if (
    f.includes("metrics_pip.ch0.mechanical_ventilator") || 
    f.includes("metrics_peep.ch0.mechanical_ventilator")  
  ) {
    return "cmH₂O";
  }
  return group.unit || "";
};
  useEffect(() => {
    const fetchOperationDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await api.get<{ data: OperationData }>(`/operations/${id}/data`)
        const operationData = response.data.data

        console.log("Received operation data:", operationData)
        setOperation(operationData)

				if (operationData.meritve) {
					const deviceGroups: { [key: string]: Device } = {};

					operationData.meritve.forEach((group) => {
						const deviceName = extractDeviceName(group.deviceId);

						if (!deviceGroups[deviceName]) {
							deviceGroups[deviceName] = {
								deviceName,
								displayName: getDeviceDisplayName(deviceName),
								metrics: [],
								totalMeasurements: 0,
							};
						}

						deviceGroups[deviceName].metrics.push(group);
						deviceGroups[deviceName].totalMeasurements += group.data.length;
					});

					const devices = Object.values(deviceGroups);
					setAvailableDevices(devices);

					const allDeviceNames = new Set(devices.map((d) => d.deviceName));
					setSelectedDevices(allDeviceNames);

					console.log("Available devices:", devices);
				}
			} catch (error) {
				console.error("Error with getting operations data:", error);
				setError("Error loading operation data");
			} finally {
				setLoading(false);
			}
		};

		if (id) fetchOperationDetails();
	}, [id]);

	const handleDeviceToggle = (deviceName: string) => {
		const newSelected = new Set(selectedDevices);
		if (newSelected.has(deviceName)) {
			newSelected.delete(deviceName);
		} else {
			newSelected.add(deviceName);
		}
		setSelectedDevices(newSelected);
	};

	const handleSelectAll = () => {
		const allDeviceNames = new Set(availableDevices.map((d) => d.deviceName));
		setSelectedDevices(allDeviceNames);
	};

	const handleDeselectAll = () => {
		setSelectedDevices(new Set());
	};

	const filteredMeritve =
		operation?.meritve.filter((group) => {
			const deviceName = extractDeviceName(group.deviceId);
			return selectedDevices.has(deviceName);
		}) || [];

	const filteredDeviceGroups = availableDevices
		.filter((device) => selectedDevices.has(device.deviceName))
		.map((device) => ({
			...device,
			metrics: device.metrics.filter((metric) =>
				selectedDevices.has(device.deviceName)
			),
		}));

	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-white p-3 border border-gray-300 rounded shadow">
					<p className="text-sm font-medium">{`Time: ${new Date(
						new Date(label).getTime() + 2 * 60 * 60 * 1000
					).toLocaleTimeString("en-US", { hour12: false })}`}</p>
					<p className="text-sm text-blue-600">
						{`${payload[0].name}: ${payload[0].value} ${
							payload[0].payload.unit || ""
						}`}
					</p>
				</div>
			);
		}
		return null;
	};

	const getLineColor = (index: number) => {
		const colors = [
			"#8884d8",
			"#82ca9d",
			"#ffc658",
			"#ff7300",
			"#8dd1e1",
			"#d084d0",
			"#ff6b6b",
		];
		return colors[index % colors.length];
	};

	const getAverageMeasurementsPerMetric = (device: Device) => {
		if (device.metrics.length === 0) return 0;
		return Math.round(device.totalMeasurements / device.metrics.length);
	};

	if (loading) {
		return (
			<Box
				sx={{
					p: 3,
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "200px",
				}}
			>
				<CircularProgress />
				<Typography sx={{ ml: 2 }}>Loading data...</Typography>
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ p: 3 }}>
				<Alert severity="error">
					{error || "Error loading operation data"}
				</Alert>
			</Box>
		);
	}

	if (!operation) {
		return (
			<Box sx={{ p: 3 }}>
				<Alert severity="warning">Operation not found</Alert>
			</Box>
		);
	}

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h4" gutterBottom>
				Operation Details
			</Typography>

			<Paper sx={{ p: 3, mb: 3 }}>
				<Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
					Basic Information
				</Typography>
				<Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
					<Box
						sx={{
							flex: "1 1 300px",
							minWidth: "250px",
							p: 2,
							bgcolor: "primary.50",
							borderRadius: 2,
							border: "1px solid",
							borderColor: "primary.100",
						}}
					>
						<Typography
							variant="subtitle2"
							color="primary.main"
							sx={{ fontWeight: 600, mb: 1 }}
						>
							Patient Information
						</Typography>
						<Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
							{`${operation.Pacient.ime} ${operation.Pacient.priimek}`}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Born:{" "}
							{new Date(operation.Pacient.datum_rojstva).toLocaleDateString(
								"en-US"
							)}
						</Typography>
					</Box>

					<Box
						sx={{
							flex: "1 1 250px",
							minWidth: "200px",
							p: 2,
							bgcolor: "success.50",
							borderRadius: 2,
							border: "1px solid",
							borderColor: "success.100",
						}}
					>
						<Typography
							variant="subtitle2"
							color="success.main"
							sx={{ fontWeight: 600, mb: 1 }}
						>
							Location
						</Typography>
						<Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
							{operation.Soba.naziv}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{operation.Soba.lokacija}
						</Typography>
					</Box>

					<Box
						sx={{
							flex: "1 1 250px",
							minWidth: "200px",
							p: 2,
							bgcolor: "warning.50",
							borderRadius: 2,
							border: "1px solid",
							borderColor: "warning.100",
						}}
					>
						<Typography
							variant="subtitle2"
							color="warning.main"
							sx={{ fontWeight: 600, mb: 1 }}
						>
							Operation Schedule
						</Typography>
						<Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
							{operation.datum}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{`${operation.cas_zacetka} – ${operation.cas_konca}`}
						</Typography>
					</Box>
				</Box>
			</Paper>

			{availableDevices.length > 0 && (
				<Paper sx={{ p: 3, mb: 3 }}>
					<Typography
						variant="h6"
						gutterBottom
						sx={{ display: "flex", alignItems: "center" }}
					>
						<BarChartIcon sx={{ mr: 1 }} color="primary" />
						Device Selection
					</Typography>

					<Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
						<Button
							startIcon={<SelectAll />}
							onClick={handleSelectAll}
							variant="contained"
							size="small"
							color="primary"
							sx={{ mr: 1 }}
						>
							Select All
						</Button>
						<Button
							startIcon={<ClearAll />}
							onClick={handleDeselectAll}
							variant="outlined"
							size="small"
							color="secondary"
						>
							Clear All
						</Button>
					</Box>

					<Box sx={{ mb: 3 }}>
						<Typography variant="subtitle2" color="text.secondary" gutterBottom>
							Selected devices ({selectedDevices.size}/{availableDevices.length}
							):
						</Typography>
						<Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
							{availableDevices
								.filter((device) => selectedDevices.has(device.deviceName))
								.map((device) => (
									<Chip
										key={device.deviceName}
										label={`${device.displayName} (${device.metrics.length} metrics)`}
										onDelete={() => handleDeviceToggle(device.deviceName)}
										color="primary"
										variant="filled"
										size="small"
									/>
								))}
							{selectedDevices.size === 0 && (
								<Typography
									variant="body2"
									color="text.secondary"
									fontStyle="italic"
								>
									No devices selected
								</Typography>
							)}
						</Stack>
					</Box>

					<Divider sx={{ mb: 3 }} />

					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
							gap: 2,
						}}
					>
						{availableDevices.map((device) => (
							<Card
								key={device.deviceName}
								variant="outlined"
								sx={{
									borderColor: selectedDevices.has(device.deviceName)
										? "primary.main"
										: "divider",
									bgcolor: selectedDevices.has(device.deviceName)
										? "primary.50"
										: "background.paper",
									transition: "all 0.2s",
								}}
							>
								<CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
									<Box
										sx={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											mb: 1,
										}}
									>
										<Typography variant="subtitle1" fontWeight="medium">
											{device.displayName}
										</Typography>
										<Checkbox
											checked={selectedDevices.has(device.deviceName)}
											onChange={() => handleDeviceToggle(device.deviceName)}
											icon={<VisibilityOff />}
											checkedIcon={<Visibility />}
											color="primary"
										/>
									</Box>
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											gap: 1,
											flexWrap: "wrap",
										}}
									>
										<Chip
											size="small"
											label={`${device.metrics.length} metrics`}
											color={
												selectedDevices.has(device.deviceName)
													? "primary"
													: "default"
											}
											variant="outlined"
										/>
										<Chip
											label={`~ ${getAverageMeasurementsPerMetric(
												device
											)} measurements / metric`}
											size="small"
											color={
												selectedDevices.has(device.deviceName)
													? "primary"
													: "default"
											}
											variant="outlined"
										/>
									</Box>
								</CardContent>
							</Card>
						))}
					</Box>
				</Paper>
			)}

			{operation.meritve && operation.meritve.length > 0 ? (
				<>
					<Typography
						variant="h5"
						gutterBottom
						sx={{ mt: 3, display: "flex", alignItems: "center" }}
					>
						<ShowChart sx={{ mr: 1 }} color="primary" />
						Vital Signs
						{selectedDevices.size < availableDevices.length && (
							<Typography
								variant="body2"
								color="text.secondary"
								component="span"
								sx={{ ml: 2 }}
							>
								(Showing {selectedDevices.size} of {availableDevices.length}{" "}
								devices)
							</Typography>
						)}
					</Typography>

					{filteredDeviceGroups.length > 0 ? (
						filteredDeviceGroups.map((device) => (
							<Paper sx={{ p: 3, mb: 3 }} key={device.deviceName}>
								<Typography
									variant="h5"
									gutterBottom
									color="primary"
									sx={{ display: "flex", alignItems: "center" }}
								>
									{device.displayName}
									<Chip
										label={`${device.metrics.length} metrics`}
										size="small"
										variant="outlined"
										sx={{ ml: 2 }}
									/>
								</Typography>

								{device.metrics.map((group, idx) => (
									<Box key={`${group.deviceId}-${group.field}`} sx={{ mb: 4 }}>
										<Typography variant="h6" gutterBottom>
											{group.label} ({getProperUnit(group)})
										</Typography>

										<Box
											sx={{
												mb: 2,
												p: 2,
												bgcolor: "grey.50",
												borderRadius: 2,
												display: "flex",
												flexWrap: "wrap",
												gap: 2,
											}}
										>
											<Chip
												icon={<BarChartIcon fontSize="small" />}
												label={`Measurements: ${group.data.length}`}
												size="small"
												color="primary"
												variant="outlined"
											/>
											<Chip
												label={`Min: ${Math.min(
													...group.data.map((d) => d.value)
												).toFixed(1)} ${getProperUnit(group)}`}
												size="small"
												color="info"
												variant="outlined"
											/>
											<Chip
												label={`Max: ${Math.max(
													...group.data.map((d) => d.value)
												).toFixed(1)} ${getProperUnit(group)}`}
												size="small"
												color="error"
												variant="outlined"
											/>
											<Chip
												label={`Average: ${(
													group.data.reduce((sum, d) => sum + d.value, 0) /
													group.data.length
												).toFixed(1)} ${getProperUnit(group)}`}
												size="small"
												color="success"
												variant="outlined"
											/>
										</Box>

										<div
											style={{
												width: "100%",
												overflowX: "auto",
												overflowY: "hidden",
											}}
										>
											<div style={{ display: "flex", alignItems: "center" }}>
												<div
													style={{
														writingMode: "vertical-rl",
														textOrientation: "mixed",
														marginRight: "10px",
														fontSize: "12px",
														color: "#666",
														minWidth: "20px",
													}}
												>
													{getProperUnit(group)}
												</div>
												<div
													style={{
														width: Math.max(group.data.length * 15, 800),
														height: 300,
													}}
												>
													<LineChart
														width={Math.max(group.data.length * 15, 800)}
														height={300}
														data={group.data}
														margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
													>
														<CartesianGrid strokeDasharray="3 3" />
														<XAxis
															dataKey="time"
															tickFormatter={(time) =>
																new Date(
																	new Date(time).getTime() + 2 * 60 * 60 * 1000
																).toLocaleTimeString("en-US", { hour12: false })
															}
															interval="preserveStartEnd"
															height={50}
															label={{
																value: "Time",
																position: "insideBottom",
																offset: -10,
															}}
														/>
														<YAxis
															domain={["auto", "auto"]}
															padding={{ bottom: 0 }}
															tickCount={6}
															allowDecimals
														/>
														<Tooltip content={<CustomTooltip />} />
														<Legend />
														<Line
															type="monotone"
															dataKey="value"
															stroke={getLineColor(idx)}
															strokeWidth={2}
															dot={{ r: 3 }}
															name={group.label}
															connectNulls={false}
														/>
													</LineChart>
												</div>
											</div>
										</div>
									</Box>
								))}
							</Paper>
						))
					) : (
						<Paper sx={{ p: 2, mb: 3 }}>
							<Alert severity="info">
								No devices selected for display. Please select devices above.
							</Alert>
						</Paper>
					)}
				</>
			) : (
				<Paper sx={{ p: 2, mb: 3 }}>
					<Typography variant="h6" gutterBottom>
						Vital Signs
					</Typography>
					<Alert severity="info">
						No vital sign measurements available for this operation.
					</Alert>
				</Paper>
			)}
		</Box>
	);
};

export default OperationDetailsPage;
