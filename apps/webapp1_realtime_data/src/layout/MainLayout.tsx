// components/MainLayout.tsx
import React from "react";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import "../App.css"; // Make sure this path is correct
import api from "../api";
import { useNavigate } from "react-router-dom";
interface MainLayoutProps {
	children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
	const navigate = useNavigate();
	const handleLogout = () => {
		api.post("/users/logout");
		navigate("/login");
	};

	return (
		<div>
			<AppBar position="relative" color="default" className="main-header">
				<Toolbar className="main-toolbar">
					<Box className="button-group">
						<Button className="nav-button" variant="contained" color="primary">
							VKLOPI MEDICINSKE NAPRAVE
						</Button>
						<Button className="nav-button" variant="contained" color="primary">
							IZKLOPI MEDICINSKE NAPRAVE
						</Button>
						<Button className="nav-button" variant="contained" color="primary">
							KONTROLA NAD PRIKAZOM MEDICINSKIH NAPRAV
						</Button>
						<Button className="nav-button" variant="contained" color="primary">
							PODATKI O PACIENTU
						</Button>
						<Button
							className="nav-button large"
							variant="contained"
							color="primary"
						>
							OPERACIJSKA SOBA
						</Button>
						<Toolbar>
							<Button onClick={handleLogout}>Odjava</Button>
						</Toolbar>
					</Box>
				</Toolbar>
			</AppBar>
			<main className="main-content">{children}</main>
		</div>
	);
};

export default MainLayout;
