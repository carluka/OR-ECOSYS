import { Box, Button } from "@mui/material";
import Navigation from "../components/Navigation";
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
		<Box sx={{ display: "flex", width: "100vw", height: "100vh", margin: 0 }}>
			{/* Sidebar - fixed width and border */}
			<Box
				sx={{
					width: 240,
					height: "100%",
					bgcolor: "#f5f5f5",
					borderRight: "1px solid #ccc",
				}}
			>
				<Navigation />
			</Box>

			{/* Right content area */}
			<Box
				sx={{
					flexGrow: 1,
					display: "flex",
					flexDirection: "column",
					height: "100%",
				}}
			>
				{/* Top bar */}
				<Box
					sx={{
						height: 65,
						display: "flex",
						justifyContent: "flex-end",
						alignItems: "center",
						px: 3,
						borderBottom: "1px solid #ccc",
						boxSizing: "border-box",
					}}
				>
					<Button onClick={handleLogout} variant="contained" color="error">
						Odjava
					</Button>
				</Box>

				{/* Main content */}
				<Box sx={{ flexGrow: 1, p: 4 }}>{children}</Box>
			</Box>
		</Box>
	);
};

export default MainLayout;
