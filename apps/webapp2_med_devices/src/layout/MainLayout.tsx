import { Box } from "@mui/material";
import Navigation from "../components/Navigation";

interface MainLayoutProps {
	children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
	return (
		<Box
			sx={{
				display: "flex",
				width: "100vw",
				height: "100vh",
				margin: 0,
				overflow: "hidden",
			}}
		>
			<Box
				sx={{
					width: 240,
					height: "100%",
					borderRight: "1px solid #ccc",
					overflowY: "auto",
				}}
			>
				<Navigation />
			</Box>

			<Box
				sx={{
					flexGrow: 1,
					height: "100%",
					overflowY: "auto",
					p: 4,
					bgcolor: "#fafafa",
				}}
			>
				{children}
			</Box>
		</Box>
	);
};

export default MainLayout;
