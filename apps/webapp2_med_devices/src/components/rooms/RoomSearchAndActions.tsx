import type React from "react";
import { Box, Paper, TextField, InputAdornment, Button } from "@mui/material";
import { Search, Add } from "@mui/icons-material";

interface RoomSearchAndActionsProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	onAddRoom: () => void;
}

export const RoomSearchAndActions: React.FC<RoomSearchAndActionsProps> = ({
	searchTerm,
	onSearchChange,
	onAddRoom,
}) => {
	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "space-between",
				mb: 3,
				flexWrap: "wrap",
				gap: 2,
			}}
		>
			<Paper
				sx={{
					p: 1,
					display: "flex",
					alignItems: "center",
					flexGrow: 1,
					maxWidth: "500px",
				}}
			>
				<TextField
					placeholder="Search rooms..."
					value={searchTerm}
					onChange={(e) => onSearchChange(e.target.value)}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<Search />
							</InputAdornment>
						),
					}}
					sx={{ flexGrow: 1 }}
					size="small"
					variant="standard"
				/>
			</Paper>

			<Button
				variant="contained"
				startIcon={<Add />}
				color="primary"
				onClick={onAddRoom}
			>
				Add New Room
			</Button>
		</Box>
	);
};
