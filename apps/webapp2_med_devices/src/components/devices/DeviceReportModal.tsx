import {
	Dialog,
	DialogTitle,
	DialogContent,
	Box,
	Typography,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	IconButton,
	Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useEffect, useState } from "react";
import api from "../../api";

interface Props {
	open: boolean;
	onClose: () => void;
	deviceId: number | null;
}

interface DeviceReportServis {
	idservis: number;
	datum: string;
	ura: string;
	komentar: string;
}

interface DeviceReportOperacija {
	idoperacija: number;
	datum: string;
	cas_zacetka: string;
	cas_konca: string;
}

interface DeviceReportData {
	idnaprava: number;
	naziv: string;
	tip_naprave: string;
	soba_naziv: string | null;
	soba_lokacija: string | null;
	stanje: string | null;
	serijska_stevilka: string | null;
	znamka: string | null;
	model: string | null;
	servis: boolean;
	servisi: DeviceReportServis[];
	operacije: DeviceReportOperacija[];
}

const DeviceReportModal: React.FC<Props> = ({ open, onClose, deviceId }) => {
	const [loading, setLoading] = useState(false);
	const [reportData, setReportData] = useState<DeviceReportData | null>(null);

	useEffect(() => {
		if (open && deviceId) {
			setLoading(true);
			api
				.get<{ data: DeviceReportData }>(`/devices/${deviceId}/report-data`)
				.then((res) => setReportData(res.data.data))
				.catch(() => setReportData(null))
				.finally(() => setLoading(false));
		} else {
			setReportData(null);
		}
	}, [open, deviceId]);

	const handleDownloadReport = async () => {
		if (!deviceId) return;
		try {
			const res = await api.get(`/devices/${deviceId}/report-pdf`, {
				responseType: "blob",
			});
			const url = window.URL.createObjectURL(
				new Blob([res.data], { type: "application/pdf" })
			);
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", `report-device-${deviceId}.pdf`);
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch {
			alert("Failed to download PDF report.");
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle sx={{ m: 0, p: 2 }}>
				Device Report Overview
				<IconButton
					aria-label="close"
					onClick={onClose}
					sx={{ position: "absolute", right: 8, top: 8 }}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent dividers>
				{loading ? (
					<Typography>Loading...</Typography>
				) : reportData ? (
					<Box>
						<Typography variant="h6" gutterBottom>
							Device name: <strong>{reportData.naziv}</strong>
						</Typography>
						<Table size="small" sx={{ mb: 2 }}>
							<TableBody>
								<TableRow>
									<TableCell>
										<strong>Device Type</strong>
									</TableCell>
									<TableCell>{reportData.tip_naprave}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>
										<strong>Room Name</strong>
									</TableCell>
									<TableCell>
										{reportData.soba_naziv ? reportData.soba_naziv : "No room"}
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>
										<strong>Room Location</strong>
									</TableCell>
									<TableCell>
										{reportData.soba_naziv
											? reportData.soba_lokacija
											: "No room"}
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>
										<strong>Has been serviced in the last 2 months</strong>
									</TableCell>
									<TableCell>{reportData.servis ? "YES" : "NO"}</TableCell>
								</TableRow>
							</TableBody>
						</Table>
						<Box>
							<Typography variant="subtitle1" gutterBottom>
								<strong>Services:</strong>
							</Typography>
							{Array.isArray(reportData.servisi) &&
							reportData.servisi.length > 0 ? (
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell>Date</TableCell>
											<TableCell>Time</TableCell>
											<TableCell>Comment</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{[...reportData.servisi]
											.sort(
												(a, b) =>
													new Date(b.datum).getTime() -
													new Date(a.datum).getTime()
											)
											.map((servis) => (
												<TableRow key={servis.idservis}>
													<TableCell>
														{new Date(servis.datum).toLocaleDateString()}
													</TableCell>
													<TableCell>{servis.ura}</TableCell>
													<TableCell>{servis.komentar}</TableCell>
												</TableRow>
											))}
									</TableBody>
								</Table>
							) : (
								<Typography color="text.secondary">
									No services have been recorded.
								</Typography>
							)}
						</Box>

						<Box mt={3}>
							<Typography variant="subtitle1" gutterBottom>
								<strong>Operations in this room:</strong>
							</Typography>
							{Array.isArray(reportData.operacije) &&
							reportData.operacije.length > 0 ? (
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell>Date</TableCell>
											<TableCell>Start Time</TableCell>
											<TableCell>End Time</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{[...reportData.operacije]
											.sort(
												(a, b) =>
													new Date(b.datum).getTime() -
													new Date(a.datum).getTime()
											)
											.map((op) => (
												<TableRow key={op.idoperacija}>
													<TableCell>
														{new Date(op.datum).toLocaleDateString()}
													</TableCell>
													<TableCell>{op.cas_zacetka}</TableCell>
													<TableCell>{op.cas_konca}</TableCell>
												</TableRow>
											))}
									</TableBody>
								</Table>
							) : (
								<Typography color="text.secondary">
									No operations have been recorded in this room.
								</Typography>
							)}
						</Box>

						<Box mt={3} display="flex" justifyContent="flex-end">
							<Button
								variant="contained"
								startIcon={<PictureAsPdfIcon />}
								onClick={handleDownloadReport}
							>
								Download Report
							</Button>
						</Box>
					</Box>
				) : (
					<Typography color="error">No data for report.</Typography>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default DeviceReportModal;
