import type React from "react";

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
	Box,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Divider,
	Typography,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	IconButton,
} from "@mui/material";
import {
	DeviceHub as DeviceHubIcon,
	MeetingRoom as MeetingRoomIcon,
	People as PeopleIcon,
	DashboardCustomize as DashboardCustomizeIcon,
	Logout as LogoutIcon,
	Close as CloseIcon,
} from "@mui/icons-material";
import api from "../api";
import { useNavigate } from "react-router-dom";

const Navigation: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [openLogoutModal, setOpenLogoutModal] = useState(false);

	const handleLogoutClick = () => {
		setOpenLogoutModal(true);
	};

	const handleLogoutConfirm = () => {
		api.post("/users/logout").finally(() => {
			navigate("/login");
		});
		setOpenLogoutModal(false);
	};

	const handleLogoutCancel = () => {
		setOpenLogoutModal(false);
	};

	const isActive = (path: string) => {
		return location.pathname === path;
	};

	const navItems = [
		{
			title: "Devices",
			path: "/",
			icon: <DeviceHubIcon />,
		},
		{
			title: "Operation Rooms",
			path: "/operationRooms",
			icon: <MeetingRoomIcon />,
		},
		{
			title: "Users",
			path: "/userHandling",
			icon: <PeopleIcon />,
		},
	];

	return (
		<>
			<Box
				sx={{
					height: "100%",
					display: "flex",
					flexDirection: "column",
					bgcolor: "background.paper",
					borderRight: "1px solid",
					borderColor: "divider",
				}}
			>
				{/* Header */}
				<Box
					sx={{
						p: 3,
						display: "flex",
						alignItems: "center",
						gap: 1.5,
						borderBottom: "1px solid",
						borderColor: "divider",
						bgcolor: "primary.main",
						color: "primary.contrastText",
					}}
				>
					<DashboardCustomizeIcon sx={{ fontSize: 28 }} />
					<Typography
						variant="h6"
						fontWeight="bold"
						sx={{
							letterSpacing: "0.5px",
							fontSize: "1.1rem",
						}}
					>
						ADMIN DASHBOARD
					</Typography>
				</Box>

				{/* Navigation List */}
				<List
					sx={{
						py: 2,
						flexGrow: 1,
						px: 1,
					}}
				>
					{navItems.map((item) => (
						<ListItemButton
							key={item.path}
							component={Link}
							to={item.path}
							selected={isActive(item.path)}
							sx={{
								py: 1.5,
								px: 2,
								mb: 1,
								borderRadius: 2,
								transition: "all 0.2s ease",
								"&.Mui-selected": {
									bgcolor: "primary.main",
									color: "primary.contrastText",
									"&:hover": {
										bgcolor: "primary.dark",
									},
									"& .MuiListItemIcon-root": {
										color: "primary.contrastText",
									},
								},
								"&:hover": {
									bgcolor: isActive(item.path)
										? "primary.dark"
										: "action.hover",
									transform: "translateX(4px)",
								},
							}}
						>
							<ListItemIcon
								sx={{
									minWidth: 40,
									color: isActive(item.path)
										? "primary.contrastText"
										: "text.secondary",
								}}
							>
								{item.icon}
							</ListItemIcon>
							<ListItemText
								primary={item.title}
								primaryTypographyProps={{
									fontWeight: isActive(item.path) ? 600 : 500,
									fontSize: "0.95rem",
								}}
							/>
						</ListItemButton>
					))}
				</List>

				<Divider sx={{ mx: 2 }} />

				{/* Logout Button */}
				<Box sx={{ p: 2 }}>
					<ListItemButton
						onClick={handleLogoutClick}
						sx={{
							py: 1.5,
							px: 2,
							borderRadius: 2,
							transition: "all 0.2s ease",
							"&:hover": {
								bgcolor: "error.light",
								transform: "translateX(4px)",
								"& .MuiListItemIcon-root": {
									color: "error.main",
								},
								"& .MuiListItemText-primary": {
									color: "error.main",
								},
							},
						}}
					>
						<ListItemIcon
							sx={{
								minWidth: 40,
								color: "text.secondary",
							}}
						>
							<LogoutIcon />
						</ListItemIcon>
						<ListItemText
							primary="Sign Out"
							primaryTypographyProps={{
								fontWeight: 500,
								fontSize: "0.95rem",
							}}
						/>
					</ListItemButton>
				</Box>
			</Box>

			{/* Logout Confirmation Modal */}
			<Dialog
				open={openLogoutModal}
				onClose={handleLogoutCancel}
				PaperProps={{
					elevation: 8,
					sx: { borderRadius: 3, minWidth: 400 },
				}}
			>
				<DialogTitle
					sx={{
						bgcolor: "warning.light",
						color: "warning.contrastText",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						pb: 2,
						mb: 2,
					}}
				>
					<Typography variant="h6" fontWeight="bold">
						Confirm Sign Out
					</Typography>
					<IconButton
						aria-label="close"
						onClick={handleLogoutCancel}
						size="small"
						sx={{ color: "inherit" }}
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent sx={{ pt: 3, pb: 2, px: 3 }}>
					<Typography variant="body1" gutterBottom>
						Are you sure you want to sign out of the admin dashboard?
					</Typography>
					<Typography variant="body2" color="text.secondary">
						You will need to log in again to access the system.
					</Typography>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
					<Button
						variant="outlined"
						onClick={handleLogoutCancel}
						sx={{ minWidth: 100 }}
					>
						Cancel
					</Button>
					<Button
						variant="contained"
						color="warning"
						onClick={handleLogoutConfirm}
						startIcon={<LogoutIcon />}
						sx={{ minWidth: 100 }}
					>
						Sign Out
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default Navigation;
