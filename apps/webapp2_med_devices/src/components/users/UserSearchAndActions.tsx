import type React from "react";
import { Box, Button, Paper, TextField, InputAdornment } from "@mui/material";
import { Add, Search } from "@mui/icons-material";

interface UserSearchAndActionsProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	onAddUser: () => void;
}

const UserSearchAndActions: React.FC<UserSearchAndActionsProps> = ({
	searchTerm,
	onSearchChange,
	onAddUser,
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
					placeholder="Search users..."
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
				onClick={onAddUser}
			>
				Add New User
			</Button>
		</Box>
	);
};

export default UserSearchAndActions;
