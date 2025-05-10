// components/MainLayout.tsx
import React, { ReactNode } from "react";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import "../App.css"; // Make sure this path is correct

interface MainLayoutProps {
	children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
	return (
		<div>
			<AppBar position="sticky" color="default" className="main-header">
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
						<Button className="nav-button" variant="contained" color="primary">
							PRIJAVA
						</Button>
						<Button className="nav-button" variant="contained" color="primary">
							ODJAVA
						</Button>
					</Box>
				</Toolbar>
			</AppBar>
			<main className="main-content">{children}</main>
		</div>
	);
};

export default MainLayout;
