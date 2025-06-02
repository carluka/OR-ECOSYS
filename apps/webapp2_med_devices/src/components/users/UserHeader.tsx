import type React from "react";
import { Box, Typography } from "@mui/material";
import { People } from "@mui/icons-material";

interface UserHeaderProps {
	title?: string;
	subtitle?: string;
}

const UserHeader: React.FC<UserHeaderProps> = ({
	title = "User Management",
	subtitle = "Manage system users and their permissions",
}) => {
	return (
		<Box sx={{ mb: 4 }}>
			<Typography
				variant="h4"
				gutterBottom
				sx={{ display: "flex", alignItems: "center" }}
			>
				<People sx={{ mr: 1 }} color="primary" />
				{title}
			</Typography>
			<Typography variant="body1" color="text.secondary">
				{subtitle}
			</Typography>
		</Box>
	);
};

export default UserHeader;
