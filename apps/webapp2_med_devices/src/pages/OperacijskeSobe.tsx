import MainLayout from "../layout/MainLayout";
import { Typography } from "@mui/material";

const OperacijskeSobe: React.FC = () => {
	return (
		<MainLayout>
			<Typography variant="h4" gutterBottom>
				OPERACIJSKE SOBE
			</Typography>
			{/* Add table and other UI here */}
		</MainLayout>
	);
};

export default OperacijskeSobe;
