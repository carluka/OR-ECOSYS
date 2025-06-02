import type React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import type { RoomStats } from "../../types/room.types";

interface RoomSummaryCardsProps {
	stats: RoomStats;
}

export const RoomSummaryCards: React.FC<RoomSummaryCardsProps> = ({
	stats,
}) => {
	const cards = [
		{
			title: "Total Rooms",
			value: stats.totalRooms,
			color: "primary.main",
		},
		{
			title: "Active Rooms",
			value: stats.activeRooms,
			color: "info.main",
		},
		{
			title: "Assigned Devices",
			value: stats.assignedDevices,
			color: "success.main",
		},
		{
			title: "Unassigned Devices",
			value: stats.unassignedDevices,
			color: "warning.main",
		},
		{
			title: "Pending Changes",
			value: stats.roomsWithUnsavedChanges,
			color: "error.main",
		},
	];

	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
				gap: 2,
				mb: 3,
			}}
		>
			{cards.map((card) => (
				<Card key={card.title} variant="outlined">
					<CardContent sx={{ textAlign: "center", py: 2 }}>
						<Typography variant="h4" color={card.color} fontWeight="bold">
							{card.value}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{card.title}
						</Typography>
					</CardContent>
				</Card>
			))}
		</Box>
	);
};
