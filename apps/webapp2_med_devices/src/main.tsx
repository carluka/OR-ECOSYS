import React from "react";
import ReactDOM from "react-dom/client";
//import App from "./App.tsx";
import Login from "./pages/Login";
//import AddUser from "./pages/AddUser";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NotFoundPage from "./pages/NotFoundPage";
import PregledVsehNaprav from "./pages/PregledVsehNaprav";
import ServisiNaprav from "./pages/ServisiNaprav";
import OperacijskeSobe from "./pages/OperacijskeSobe";
import UpravljanjeZOsebjem from "./pages/UpravljanjeZOsebjem";
const router = createBrowserRouter([
	{
		path: "/",
		element: <PregledVsehNaprav />,
		errorElement: <NotFoundPage />,
	},
	{
		path: "/login",
		element: <Login />,
	},
	{
		path: "/servisiNaprav",
		element: <ServisiNaprav />,
	},
	{
		path: "/operacijskeSobe",
		element: <OperacijskeSobe />,
	},
	{
		path: "/upravljanjeZOsebjem",
		element: <UpravljanjeZOsebjem />,
	},
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);
