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
import HomeIcon from "@mui/icons-material/Home";
import BuildIcon from "@mui/icons-material/Build";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import PeopleIcon from "@mui/icons-material/People";

const Navigation: React.FC = () => {
	return (
		<Box
			sx={{
				width: 240,
				height: "100vh",
				bgcolor: "#f0f0f0",
				display: "flex",
				flexDirection: "column",
				borderRight: "1px solid #ccc", // use exact value for pixel match
				boxSizing: "border-box",
			}}
		>
			{/* REMOVE outer padding here! */}
			<Typography
				variant="h6"
				sx={{ textAlign: "center", mt: 2, mb: 2, fontWeight: "bold" }}
			>
				NADZORNA PLOŠČA
			</Typography>

			<Divider />

			<List disablePadding>
				<ListItemButton component={Link} to="/">
					<ListItemIcon>
						<HomeIcon />
					</ListItemIcon>
					<ListItemText primary="Pregled vseh naprav" />
				</ListItemButton>
				<ListItemButton component={Link} to="/servisiNaprav">
					<ListItemIcon>
						<BuildIcon />
					</ListItemIcon>
					<ListItemText primary="Servisi naprav" />
				</ListItemButton>
				<ListItemButton component={Link} to="/operacijskeSobe">
					<ListItemIcon>
						<MeetingRoomIcon />
					</ListItemIcon>
					<ListItemText primary="Operacijske sobe" />
				</ListItemButton>
				<ListItemButton component={Link} to="/upravljanjeZOsebjem">
					<ListItemIcon>
						<PeopleIcon />
					</ListItemIcon>
					<ListItemText primary="Upravljanje z osebjem" />
				</ListItemButton>
			</List>
		</Box>
	);
};

export default Navigation;
