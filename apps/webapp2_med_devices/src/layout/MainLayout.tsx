import type React from "react";

import { useState } from "react";
import {
	Box,
	Paper,
	IconButton,
	useMediaQuery,
	useTheme,
	Drawer,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import Navigation from "../components/Navigation";

interface MainLayoutProps {
	children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));
	const [mobileOpen, setMobileOpen] = useState(false);

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen);
	};

	return (
		<Box
			sx={{
				display: "flex",
				width: "100vw",
				height: "100vh",
				margin: 0,
				overflow: "hidden",
				bgcolor: "#f5f7fa",
			}}
		>
			{/* Mobile drawer */}
			{isMobile && (
				<>
					<IconButton
						color="inherit"
						aria-label="open drawer"
						edge="start"
						onClick={handleDrawerToggle}
						sx={{
							position: "fixed",
							top: 10,
							left: 10,
							zIndex: 1200,
							bgcolor: "background.paper",
							boxShadow: 1,
							"&:hover": {
								bgcolor: "background.paper",
							},
						}}
					>
						<MenuIcon />
					</IconButton>
					<Drawer
						variant="temporary"
						open={mobileOpen}
						onClose={handleDrawerToggle}
						ModalProps={{
							keepMounted: true, // Better open performance on mobile
						}}
						sx={{
							"& .MuiDrawer-paper": {
								width: 240,
								boxSizing: "border-box",
								border: "none",
							},
						}}
					>
						<Navigation />
					</Drawer>
				</>
			)}

			{/* Desktop sidebar */}
			{!isMobile && (
				<Box
					component={Paper}
					elevation={4}
					sx={{
						width: 240,
						height: "100%",
						overflowY: "auto",
						borderRadius: 0,
						borderRight: "none",
						zIndex: 10,
					}}
				>
					<Navigation />
				</Box>
			)}

			{/* Main content */}
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					height: "100%",
					overflowY: "auto",
					p: { xs: 2, sm: 3, md: 4 },
					bgcolor: "#f5f7fa",
					transition: "all 0.3s",
					"&::-webkit-scrollbar": {
						width: "8px",
					},
					"&::-webkit-scrollbar-track": {
						background: "transparent",
					},
					"&::-webkit-scrollbar-thumb": {
						background: "rgba(0,0,0,0.1)",
						borderRadius: "4px",
					},
				}}
			>
				{/* Add padding for mobile view to account for the menu button */}
				{isMobile && <Box sx={{ height: "40px" }} />}
				{children}
			</Box>
		</Box>
	);
};

export default MainLayout;
