import type React from "react";
import {
	Paper,
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Checkbox,
	Box,
	Typography,
	Avatar,
	Chip,
	IconButton,
	Tooltip,
	TablePagination,
} from "@mui/material";
import { MoreVert, AdminPanelSettings, Person } from "@mui/icons-material";
import type { UserOverview } from "../../types/user.types";

interface UserTableProps {
	users: UserOverview[];
	filteredUsers: UserOverview[];
	selected: number[];
	page: number;
	rowsPerPage: number;
	onToggleAll: () => void;
	onToggleOne: (id: number) => void;
	onMenuOpen: (event: React.MouseEvent<HTMLElement>, userId: number) => void;
	onChangePage: (event: unknown, newPage: number) => void;
	onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
	searchTerm: string;
}

const UserTable: React.FC<UserTableProps> = ({
	users,
	filteredUsers,
	selected,
	page,
	rowsPerPage,
	onToggleAll,
	onToggleOne,
	onMenuOpen,
	onChangePage,
	onChangeRowsPerPage,
	searchTerm,
}) => {
	// Helper functions
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

	const getUserTypeIcon = (userType: string) => {
		return userType.toLowerCase().includes("admin") ? (
			<AdminPanelSettings fontSize="small" sx={{ color: "error.main" }} />
		) : (
			<Person fontSize="small" sx={{ color: "primary.main" }} />
		);
	};

	// Paginate users for current page
	const paginatedUsers = filteredUsers.slice(
		page * rowsPerPage,
		page * rowsPerPage + rowsPerPage
	);

	return (
		<>
			<Paper sx={{ overflow: "hidden" }}>
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow sx={{ bgcolor: "grey.50" }}>
								<TableCell padding="checkbox">
									<Checkbox
										indeterminate={
											selected.length > 0 &&
											selected.length < filteredUsers.length
										}
										checked={
											filteredUsers.length > 0 &&
											selected.length === filteredUsers.length
										}
										onChange={onToggleAll}
									/>
								</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>User ID</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>User</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>User Type</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{paginatedUsers.length > 0 ? (
								paginatedUsers.map((user) => (
									<TableRow
										key={user.iduporabnik}
										sx={{
											cursor: "pointer",
											"&:hover": {
												backgroundColor: "action.hover",
											},
											transition: "background-color 0.2s",
										}}
									>
										<TableCell padding="checkbox">
											<Checkbox
												checked={selected.includes(user.iduporabnik)}
												onChange={() => onToggleOne(user.iduporabnik)}
												onClick={(e) => e.stopPropagation()}
											/>
										</TableCell>
										<TableCell>
											<Chip
												label={`#${user.iduporabnik}`}
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
													sx={{
														bgcolor: getRandomColor(user.iduporabnik),
														width: 32,
														height: 32,
													}}
												>
													{getInitials(user.ime, user.priimek)}
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
															{user.ime} {user.priimek}
														</Typography>
														{getUserTypeIcon(user.TipUporabnika.naziv)}
													</Box>
												</Box>
											</Box>
										</TableCell>
										<TableCell>
											<Typography variant="body2">{user.email}</Typography>
										</TableCell>
										<TableCell>
											<Chip
												label={user.TipUporabnika.naziv}
												size="small"
												color={
													user.TipUporabnika.naziv
														.toLowerCase()
														.includes("admin")
														? "error"
														: "primary"
												}
												variant="outlined"
											/>
										</TableCell>
										<TableCell>
											<Box sx={{ display: "flex", gap: 1 }}>
												<Tooltip title="More Options">
													<IconButton
														size="small"
														onClick={(e) => onMenuOpen(e, user.iduporabnik)}
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
									<TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}>
										<Typography variant="body1" color="text.secondary">
											{searchTerm
												? "No users found matching your search."
												: "No users available."}
										</Typography>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>

			<Box
				sx={{
					mt: 2,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<Typography variant="body2" color="text.secondary">
					Showing {paginatedUsers.length} of {filteredUsers.length} users
				</Typography>
				<TablePagination
					component="div"
					count={filteredUsers.length}
					page={page}
					onPageChange={onChangePage}
					rowsPerPage={rowsPerPage}
					onRowsPerPageChange={onChangeRowsPerPage}
					rowsPerPageOptions={[5, 10, 15, 25]}
				/>
			</Box>
		</>
	);
};

export default UserTable;
