import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./components/Login";
import NotFoundPage from "./pages/NotFoundPage";

import PregledVsehNaprav from "./pages/PregledVsehNaprav";
import ServisiNaprav from "./pages/ServisiNaprav";
import OperacijskeSobe from "./pages/OperacijskeSobe";
import UpravljanjeZOsebjem from "./pages/UpravljanjeZOsebjem";
import { requireAuth } from "./auth";

export const router = createBrowserRouter([
	{
		path: "/login",
		element: <Login />,
	},
	{
		loader: requireAuth,
		errorElement: <NotFoundPage />,
		children: [
			{ index: true, element: <PregledVsehNaprav /> },
			{ path: "servisiNaprav", element: <ServisiNaprav /> },
			{ path: "operacijskeSobe", element: <OperacijskeSobe /> },
			{ path: "upravljanjeZOsebjem", element: <UpravljanjeZOsebjem /> },
			{ path: "*", element: <NotFoundPage /> },
		],
	},
]);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>
);
