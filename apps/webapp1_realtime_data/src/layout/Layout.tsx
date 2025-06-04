import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
	AppBar,
	Toolbar,
	Typography,
	Box,
	Container,
	Button,
} from "@mui/material";
import { MedicalServices, Logout } from "@mui/icons-material";
import api from "../api";

const navItems = [
	{ label: "Operation Room", path: "/" },
	{ label: "Patients", path: "/patients" },
	{ label: "Operations", path: "/operations" },
];

const Layout = () => {
	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			await api.post("/users/logout");
		} catch (err) {
			console.error("Logout napaka:", err);
		} finally {
			navigate("/login");
		}
	};

	return (
		<Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
			<AppBar
				position="sticky"
				elevation={1}
				sx={{
					bgcolor: "background.paper",
					color: "text.primary",
				}}
			>
				<Toolbar disableGutters>
					<Box sx={{ display: "flex", alignItems: "center", px: 2 }}>
						<MedicalServices sx={{ mr: 1, color: "primary.main" }} />
						<Typography
							variant="h6"
							component="div"
							sx={{
								fontWeight: 600,
								color: "primary.main",
							}}
						>
							OR-Ecosystem
						</Typography>
					</Box>

					<Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
						{navItems.map((item) => (
							<Button
								key={item.path}
								component={NavLink}
								to={item.path}
								sx={{
									textTransform: "none",
									fontWeight: 500,
									color: "text.primary",
									mx: 1,
									"&.active": {
										color: "primary.main",
										borderBottom: (theme) =>
											`2px solid ${theme.palette.primary.main}`,
									},
									"&:hover": {
										bgcolor: "action.hover",
									},
								}}
							>
								{item.label}
							</Button>
						))}
					</Box>
					<Box sx={{ display: "flex", alignItems: "center", px: 2 }}>
						<Button
							onClick={handleLogout}
							variant="outlined"
							startIcon={<Logout />}
							sx={{
								textTransform: "none",
								borderColor: "primary.main",
								color: "primary.main",
								"&:hover": {
									borderColor: "primary.dark",
									bgcolor: "primary.50",
								},
							}}
						>
							Sign Out
						</Button>
					</Box>
				</Toolbar>
			</AppBar>

			<Container
				component="main"
				maxWidth={false}
				sx={{
					flexGrow: 1,
					py: 3,
					px: { xs: 2, sm: 3 },
					bgcolor: "grey.50",
					minHeight: "calc(100vh - 64px)",
				}}
			>
				<Outlet />
			</Container>
		</Box>
	);
};

export default Layout;
