import MainLayout from "../layout/MainLayout";
import {
	TableBody,
	Typography,
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	Paper,
	Checkbox,
} from "@mui/material";

import { napraveData } from "../data/pregledVsehNaprav";

const PregledVsehNaprav: React.FC = () => {
	return (
		<MainLayout>
			<Typography variant="h4" gutterBottom>
				PREGLED VSEH NAPRAV
			</Typography>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell padding="checkbox"></TableCell>
							<TableCell>Ime</TableCell>
							<TableCell>Tip</TableCell>
							<TableCell>Stanje</TableCell>
							<TableCell>Lokacija</TableCell>
							<TableCell>Servisiran</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{napraveData.map((naprava, index) => (
							<TableRow key={index}>
								<TableCell padding="checkbox">
									<Checkbox />
								</TableCell>
								<TableCell>{naprava.ime}</TableCell>
								<TableCell>{naprava.tip}</TableCell>
								<TableCell>{naprava.stanje}</TableCell>
								<TableCell>{naprava.lokacija}</TableCell>
								<TableCell>{naprava.servisiran ? "✓" : ""}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</MainLayout>
	);
};

export default PregledVsehNaprav;
