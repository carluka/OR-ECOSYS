import type React from "react";
import { useState } from "react";
import {
	Box,
	Paper,
	TextField,
	InputAdornment,
	FormControl,
	Select,
	MenuItem,
	Button,
	Tooltip,
	type SelectChangeEvent,
} from "@mui/material";
import { Search, Add } from "@mui/icons-material";
import type { DeviceType } from "../../types/device.types";

interface DeviceFiltersProps {
	searchTerm: string;
	setSearchTerm: (term: string) => void;
	filterType: string;
	setFilterType: (type: string) => void;
	filterServis: "all" | "yes" | "no";
	setFilterServis: (servis: "all" | "yes" | "no") => void;
	filterActiveRoom: "all" | "active" | "inactive";
	setFilterActiveRoom: (activeRoom: "all" | "active" | "inactive") => void;
	tipiNaprave: DeviceType[];
	onAddDevice: () => void;
}

const DeviceFilters: React.FC<DeviceFiltersProps> = ({
	searchTerm,
	setSearchTerm,
	filterType,
	setFilterType,
	filterServis,
	setFilterServis,
	filterActiveRoom,
	setFilterActiveRoom,
	tipiNaprave,
	onAddDevice,
}) => {
	const [tooltipOpen, setTooltipOpen] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);

	return (
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
					maxWidth: "700px",
					gap: 2,
				}}
			>
				<TextField
					placeholder="Search devices..."
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
				<Box sx={{ display: "flex", gap: 1 }}>
					<Tooltip
						title="Filter by Type"
						open={tooltipOpen && !menuOpen}
						onOpen={() => setTooltipOpen(true)}
						onClose={() => setTooltipOpen(false)}
						disableFocusListener
						disableTouchListener
						arrow
					>
						<FormControl
							size="small"
							sx={{ minWidth: 120 }}
							onMouseEnter={() => setTooltipOpen(true)}
							onMouseLeave={() => setTooltipOpen(false)}
						>
							<Select
								value={filterType}
								onChange={(e: SelectChangeEvent) =>
									setFilterType(e.target.value)
								}
								displayEmpty
								variant="standard"
								sx={{ fontSize: "0.875rem" }}
								onOpen={() => setMenuOpen(true)}
								onClose={() => setMenuOpen(false)}
							>
								<MenuItem value="all">All Types</MenuItem>
								{tipiNaprave.map((tip) => (
									<MenuItem key={tip.idtip_naprave} value={tip.naziv}>
										{tip.naziv}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Tooltip>
					<Tooltip
						title="Filter by Service"
						open={tooltipOpen && !menuOpen}
						onOpen={() => setTooltipOpen(true)}
						onClose={() => setTooltipOpen(false)}
						disableFocusListener
						disableTouchListener
						arrow
					>
						<FormControl
							size="small"
							sx={{ minWidth: 100 }}
							onMouseEnter={() => setTooltipOpen(true)}
							onMouseLeave={() => setTooltipOpen(false)}
						>
							<Select
								value={filterServis}
								onChange={(e) => setFilterServis(e.target.value as any)}
								displayEmpty
								variant="standard"
								sx={{ fontSize: "0.875rem" }}
								onOpen={() => setMenuOpen(true)}
								onClose={() => setMenuOpen(false)}
							>
								<MenuItem value="all">All Service</MenuItem>
								<MenuItem value="yes">Serviced</MenuItem>
								<MenuItem value="no">Unserviced</MenuItem>
							</Select>
						</FormControl>
					</Tooltip>
					<Tooltip
						title="Filter by Room Status"
						open={tooltipOpen && !menuOpen}
						onOpen={() => setTooltipOpen(true)}
						onClose={() => setTooltipOpen(false)}
						disableFocusListener
						disableTouchListener
						arrow
					>
						<FormControl
							size="small"
							sx={{ minWidth: 120 }}
							onMouseEnter={() => setTooltipOpen(true)}
							onMouseLeave={() => setTooltipOpen(false)}
						>
							<Select
								value={filterActiveRoom}
								onChange={(e: SelectChangeEvent) =>
									setFilterActiveRoom(
										e.target.value as "all" | "active" | "inactive"
									)
								}
								displayEmpty
								variant="standard"
								sx={{ fontSize: "0.875rem" }}
								onOpen={() => setMenuOpen(true)}
								onClose={() => setMenuOpen(false)}
							>
								<MenuItem value="all">All Devices</MenuItem>
								<MenuItem value="active">Active Devices</MenuItem>
								<MenuItem value="inactive">Inactive Devices</MenuItem>
							</Select>
						</FormControl>
					</Tooltip>
				</Box>
			</Paper>

			<Button
				variant="contained"
				startIcon={<Add />}
				color="primary"
				onClick={onAddDevice}
			>
				Add New Device
			</Button>
		</Box>
	);
};

export default DeviceFilters;
