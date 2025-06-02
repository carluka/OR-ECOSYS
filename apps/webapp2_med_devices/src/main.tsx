import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./components/Login";
import NotFoundPage from "./pages/NotFoundPage";
import { createTheme } from "@mui/material/styles";
import { ThemeProvider, CssBaseline } from "@mui/material";

import Devices from "./pages/Devices";
import OperationRooms from "./pages/OperationRooms";
import UserHandling from "./pages/UserHandling";
import { requireAuth } from "./auth";

// Ustvarjene poti na frontendu

export const router = createBrowserRouter([
	{
		path: "/login",
		element: <Login />,
	},
	{
		loader: requireAuth,
		errorElement: <NotFoundPage />,
		children: [
			{ index: true, element: <Devices /> },
			{ path: "operationRooms", element: <OperationRooms /> },
			{ path: "userHandling", element: <UserHandling /> },
			{ path: "*", element: <NotFoundPage /> },
		],
	},
]);

const theme = createTheme({
	typography: {
		fontFamily: `'Public Sans', sans-serif`,
	},
});

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<RouterProvider router={router} />
		</ThemeProvider>
	</StrictMode>
);
