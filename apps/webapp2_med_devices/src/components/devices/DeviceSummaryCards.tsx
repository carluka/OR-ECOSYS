import type React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import type { DeviceOverview } from "../../types/device.types";

interface DeviceSummaryCardsProps {
	devices: DeviceOverview[];
}

const DeviceSummaryCards: React.FC<DeviceSummaryCardsProps> = ({ devices }) => {
	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
				gap: 2,
				mb: 3,
			}}
		>
			<Card variant="outlined">
				<CardContent sx={{ textAlign: "center", py: 2 }}>
					<Typography variant="h4" color="primary.main" fontWeight="bold">
						{devices.length}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Total Devices
					</Typography>
				</CardContent>
			</Card>
			<Card variant="outlined">
				<CardContent sx={{ textAlign: "center", py: 2 }}>
					<Typography variant="h4" color="success.main" fontWeight="bold">
						{devices.filter((d) => d.servis).length}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Serviced Devices
					</Typography>
				</CardContent>
			</Card>
			<Card variant="outlined">
				<CardContent sx={{ textAlign: "center", py: 2 }}>
					<Typography variant="h4" color="warning.main" fontWeight="bold">
						{devices.filter((d) => !d.servis).length}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Unserviced Devices
					</Typography>
				</CardContent>
			</Card>
		</Box>
	);
};

export default DeviceSummaryCards;
