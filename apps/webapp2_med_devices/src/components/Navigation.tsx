import { Link } from "react-router-dom";
import {
	Box,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Divider,
} from "@mui/material";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import BuildIcon from "@mui/icons-material/Build";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import PeopleIcon from "@mui/icons-material/People";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import api from "../api";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";

const Navigation: React.FC = () => {
	const navigate = useNavigate();

	const handleLogout = () => {
		api.post("/users/logout").finally(() => {
			navigate("/login");
		});
	};

	return (
		<Box
			sx={{
				height: "100vh",
				display: "flex",
				flexDirection: "column",
				borderRight: "1px solid #ccc",
			}}
		>
			{/* Header */}
			<Box
				component="div"
				sx={{
					textAlign: "center",
					mt: 2,
					mb: 2,
					fontWeight: "bold",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					gap: 1,
					pl: "20px",
					pr: "20px",
				}}
			>
				<ListItemIcon sx={{ minWidth: 0, display: "flex" }}>
					<DashboardCustomizeIcon />
				</ListItemIcon>
				<ListItemText
					sx={{ m: 0, whiteSpace: "nowrap", width: "auto" }}
					disableTypography
				>
					ADMIN DASHBOARD
				</ListItemText>
			</Box>

			<Divider />

			{/* Navigation List */}
			<List disablePadding sx={{ flexGrow: 1 }}>
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
				<ListItemButton onClick={handleLogout}>
					<ListItemIcon>
						<LogoutIcon />
					</ListItemIcon>
					<ListItemText primary="Sign Out" />
				</ListItemButton>
			</List>
		</Box>
	);
};

export default Navigation;
