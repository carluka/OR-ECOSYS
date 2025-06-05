import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Typography,
	Box,
	Chip,
	Card,
	CardContent,
	TextField,
	InputAdornment,
	IconButton,
	Tooltip,
	Alert,
	CircularProgress,
	Avatar,
} from "@mui/material";
import {
	People,
	Search,
	Visibility,
	FilterList,
	MoreVert,
	Male,
	Female,
	HelpOutline,
} from "@mui/icons-material";
import api from "../../api";

interface Patient {
	idpacient: number;
	ime: string;
	priimek: string;
	spol?: string;
	datum_rojstva?: string;
}

interface ApiResponse {
	data: Patient[];
}

const PatientsPage = () => {
	const [patients, setPatients] = useState<Patient[]>([]);
	const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
		null
	);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchPatients = async () => {
			try {
				setLoading(true);
				setError(null);
				const response = await api.get<ApiResponse>("/patients");
				setPatients(response.data.data);
				setFilteredPatients(response.data.data);
			} catch (error) {
				console.error("Error fetching patients:", error);
				setError("Error loading patient data");
			} finally {
				setLoading(false);
			}
		};

		fetchPatients();
	}, []);

	useEffect(() => {
		const filtered = patients.filter(
			(patient) =>
				patient.ime.toLowerCase().includes(searchTerm.toLowerCase()) ||
				patient.priimek.toLowerCase().includes(searchTerm.toLowerCase()) ||
				patient.idpacient.toString().includes(searchTerm)
		);
		setFilteredPatients(filtered);
	}, [searchTerm, patients]);

	const handleRowClick = (patientId: number) => {
		navigate(`/patients/${patientId}`);
	};

	const handleMenuOpen = (
		event: React.MouseEvent<HTMLElement>,
		patientId: number
	) => {
		event.stopPropagation();
		setMenuAnchorEl(event.currentTarget);
		setSelectedPatientId(patientId);
	};

	const handleMenuClose = () => {
		setMenuAnchorEl(null);
		setSelectedPatientId(null);
	};

	const handleViewPatient = () => {
		if (selectedPatientId) {
			navigate(`/patients/${selectedPatientId}`);
		}
		handleMenuClose();
	};

	const handleEditPatient = (event: React.MouseEvent) => {
		event.stopPropagation();
		if (selectedPatientId) {
			navigate(`/patients/${selectedPatientId}/edit`);
		}
		handleMenuClose();
	};

	const getInitials = (firstName: string, lastName: string) => {
		return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
	};

	const getRandomColor = (id: number) => {
		const colors = [
			"primary.main",
			"secondary.main",
			"error.main",
			"warning.main",
			"info.main",
			"success.main",
			"#9c27b0",
			"#673ab7",
			"#3f51b5",
			"#2196f3",
		];
		return colors[id % colors.length];
	};

	const getGenderIcon = (spol?: string) => {
		if (!spol) return <HelpOutline fontSize="small" />;
		return spol === "Z" ? (
			<Female fontSize="small" sx={{ color: "pink" }} />
		) : (
			<Male fontSize="small" sx={{ color: "lightblue" }} />
		);
	};

	if (loading) {
		return (
			<Box
				sx={{
					p: 3,
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "400px",
				}}
			>
				<CircularProgress />
				<Typography sx={{ ml: 2 }}>Loading patients...</Typography>
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ p: 3 }}>
				<Alert severity="error">{error}</Alert>
			</Box>
		);
	}

	return (
		<Box sx={{ p: 3 }}>
			<Box sx={{ mb: 4 }}>
				<Typography
					variant="h4"
					gutterBottom
					sx={{ display: "flex", alignItems: "center" }}
				>
					<People sx={{ mr: 1 }} color="primary" />
					Patient Management
				</Typography>
				<Typography variant="body1" color="text.secondary">
					View all patient records
				</Typography>
			</Box>

			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
					gap: 2,
					mb: 3,
				}}
			>
				<Card variant="outlined">
					<CardContent sx={{ textAlign: "center", py: 2 }}>
						<Typography variant="h4" color="primary.main" fontWeight="bold">
							{patients.length}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Total Patients
						</Typography>
					</CardContent>
				</Card>
			</Box>

			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					mb: 3,
					flexWrap: "wrap",
					gap: 2,
				}}
			>
				<Paper
					sx={{
						p: 1,
						display: "flex",
						alignItems: "center",
						flexGrow: 1,
						maxWidth: "500px",
					}}
				>
					<TextField
						placeholder="Search patients..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<Search />
								</InputAdornment>
							),
						}}
						sx={{ flexGrow: 1 }}
						size="small"
						variant="standard"
					/>
					<Tooltip title="Advanced Filters">
						<IconButton>
							<FilterList />
						</IconButton>
					</Tooltip>
				</Paper>
			</Box>

			<Paper sx={{ overflow: "hidden" }}>
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow sx={{ bgcolor: "grey.50" }}>
								<TableCell sx={{ fontWeight: 600 }}>Patient ID</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>Patient</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>Date of Birth</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{filteredPatients.length > 0 ? (
								filteredPatients.map((patient) => (
									<TableRow
										key={patient.idpacient}
										onClick={() => handleRowClick(patient.idpacient)}
										sx={{
											cursor: "pointer",
											"&:hover": {
												backgroundColor: "action.hover",
											},
											transition: "background-color 0.2s",
										}}
									>
										<TableCell>
											<Chip
												label={`#${patient.idpacient}`}
												size="small"
												variant="outlined"
												color="primary"
											/>
										</TableCell>
										<TableCell>
											<Box
												sx={{ display: "flex", alignItems: "center", gap: 1 }}
											>
												<Avatar
													sx={{ bgcolor: getRandomColor(patient.idpacient) }}
												>
													{getInitials(patient.ime, patient.priimek)}
												</Avatar>
												<Box sx={{ display: "flex", flexDirection: "column" }}>
													<Box
														sx={{
															display: "flex",
															alignItems: "center",
															gap: 0.5,
														}}
													>
														<Typography variant="body2" fontWeight="medium">
															{patient.ime} {patient.priimek}
														</Typography>
														{patient.spol && getGenderIcon(patient.spol)}
													</Box>
													{patient.datum_rojstva && (
														<Typography
															variant="caption"
															color="text.secondary"
														>
															DOB:{" "}
															{new Date(
																patient.datum_rojstva
															).toLocaleDateString()}
														</Typography>
													)}
												</Box>
											</Box>
										</TableCell>
										<TableCell>
											<Typography variant="body2">
												{patient.datum_rojstva}
											</Typography>
										</TableCell>
										<TableCell>
											<Box sx={{ display: "flex", gap: 1 }}>
												<Tooltip title="View Patient">
													<IconButton
														size="small"
														color="primary"
														onClick={(e) => {
															e.stopPropagation();
															handleRowClick(patient.idpacient);
														}}
													>
														<Visibility fontSize="small" />
													</IconButton>
												</Tooltip>
												<Tooltip title="More Options">
													<IconButton
														size="small"
														onClick={(e) =>
															handleMenuOpen(e, patient.idpacient)
														}
														aria-label="more options"
													>
														<MoreVert fontSize="small" />
													</IconButton>
												</Tooltip>
											</Box>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={4} sx={{ textAlign: "center", py: 4 }}>
										<Typography variant="body1" color="text.secondary">
											{searchTerm
												? "No patients found matching your search."
												: "No patients available."}
										</Typography>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>

			{filteredPatients.length > 0 && (
				<Box
					sx={{
						mt: 2,
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<Typography variant="body2" color="text.secondary">
						Showing {filteredPatients.length} of {patients.length} patients
					</Typography>
				</Box>
			)}
		</Box>
	);
};

export default PatientsPage;
