import { Link } from "react-router-dom";
import {
	Box,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Typography,
	Divider,
} from "@mui/material";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import BuildIcon from "@mui/icons-material/Build";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import PeopleIcon from "@mui/icons-material/People";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";

const Navigation: React.FC = () => {
	return (
		<Box
			sx={{
				width: 250,
				height: "100vh",
				bgcolor: "#f0f0f0",
				display: "flex",
				flexDirection: "column",
				borderRight: "1px solid #ccc",
				boxSizing: "border-box",
			}}
		>
			<Typography
				variant="h6"
				sx={{
					textAlign: "center",
					mt: 2,
					mb: 2,
					ml: 2,
					fontWeight: "bold",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<ListItemIcon sx={{ minWidth: 0, mr: 0.5, display: "flex" }}>
					<DashboardCustomizeIcon />
				</ListItemIcon>
				<ListItemText sx={{ m: 0, ml: 0.5 }} disableTypography>
					ADMIN DASHBOARD
				</ListItemText>
			</Typography>

			<Divider />

			<List disablePadding>
				<ListItemButton component={Link} to="/">
					<ListItemIcon>
						<DeviceHubIcon />
					</ListItemIcon>
					<ListItemText primary="Devices" />
				</ListItemButton>
				<ListItemButton component={Link} to="/deviceServices">
					<ListItemIcon>
						<BuildIcon />
					</ListItemIcon>
					<ListItemText primary="Device Services" />
				</ListItemButton>
				<ListItemButton component={Link} to="/operationRooms">
					<ListItemIcon>
						<MeetingRoomIcon />
					</ListItemIcon>
					<ListItemText primary="Operation Rooms" />
				</ListItemButton>
				<ListItemButton component={Link} to="/userHandling">
					<ListItemIcon>
						<PeopleIcon />
					</ListItemIcon>
					<ListItemText primary="Users" />
				</ListItemButton>
			</List>
		</Box>
	);
};

export default Navigation;
