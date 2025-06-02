import type React from "react";
import {
	Box,
	Typography,
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Paper,
	Checkbox,
	Button,
	CircularProgress,
	Chip,
} from "@mui/material";
import { Build, Delete, Add } from "@mui/icons-material";
import type { Service } from "../../types/device.types";

interface DeviceServiceRowProps {
	deviceId: number;
	deviceName: string;
	services: Service[];
	selectedServices: number[];
	loading: boolean;
	onToggleServiceSelection: (serviceId: number) => void;
	onToggleAllServices: () => void;
	onDeleteServices: () => void;
	onAddService: () => void;
}

const DeviceServiceRow: React.FC<DeviceServiceRowProps> = ({
	deviceId,
	deviceName,
	services,
	selectedServices,
	loading,
	onToggleServiceSelection,
	onToggleAllServices,
	onDeleteServices,
	onAddService,
}) => {
	if (loading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
				<CircularProgress size={28} color="primary" />
			</Box>
		);
	}

	return (
		<Box sx={{ margin: 1 }}>
			<Typography
				variant="h6"
				gutterBottom
				component="div"
				sx={{
					display: "flex",
					alignItems: "center",
					color: "primary.main",
					borderBottom: "2px solid",
					borderColor: "primary.light",
					pb: 1,
				}}
			>
				<Build sx={{ mr: 1 }} />
				Services for {deviceName}
			</Typography>

			<TableContainer
				component={Paper}
				variant="outlined"
				sx={{
					mb: 2,
					borderRadius: 2,
					overflow: "hidden",
					boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
				}}
			>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell padding="checkbox">
								<Checkbox
									checked={
										services.length > 0 &&
										selectedServices.length === services.length
									}
									indeterminate={
										selectedServices.length > 0 &&
										selectedServices.length < services.length
									}
									onChange={onToggleAllServices}
								/>
							</TableCell>
							<TableCell sx={{ fontWeight: 600, color: "primary.dark" }}>
								Date
							</TableCell>
							<TableCell sx={{ fontWeight: 600, color: "primary.dark" }}>
								Time
							</TableCell>
							<TableCell sx={{ fontWeight: 600, color: "primary.dark" }}>
								Comment
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{services.length === 0 ? (
							<TableRow>
								<TableCell colSpan={4} sx={{ textAlign: "center", py: 3 }}>
									<Typography variant="body2" color="text.secondary">
										No services found for this device.
									</Typography>
								</TableCell>
							</TableRow>
						) : (
							services.map((service) => (
								<TableRow
									key={service.idservis}
									sx={{
										"&:hover": {
											backgroundColor: "action.hover",
										},
										transition: "background-color 0.2s",
									}}
								>
									<TableCell padding="checkbox">
										<Checkbox
											checked={selectedServices.includes(service.idservis)}
											onChange={() =>
												onToggleServiceSelection(service.idservis)
											}
										/>
									</TableCell>
									<TableCell>
										<Chip
											label={service.datum}
											size="small"
											variant="outlined"
											color="primary"
											sx={{ fontWeight: 500 }}
										/>
									</TableCell>
									<TableCell>{service.ura}</TableCell>
									<TableCell>
										<Typography
											variant="body2"
											sx={{
												maxWidth: "400px",
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
											}}
										>
											{service.komentar}
										</Typography>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
				<Button
					variant="outlined"
					color="error"
					onClick={onDeleteServices}
					disabled={!selectedServices.length}
					startIcon={<Delete />}
					size="small"
					sx={{ fontWeight: 500 }}
				>
					Remove Service{selectedServices.length > 1 ? "s" : ""}
				</Button>
				<Button
					variant="contained"
					onClick={onAddService}
					startIcon={<Add />}
					size="small"
					sx={{ fontWeight: 500 }}
				>
					Add Service
				</Button>
			</Box>
		</Box>
	);
};

export default DeviceServiceRow;
