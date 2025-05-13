import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./components/Login.tsx";
import NotFoundPage from "./components/NotFoundPage.tsx";
import { requireAuth } from "./auth.ts";

export const router = createBrowserRouter([
	{
		path: "/login",
		element: <Login />,
	},
	{
		loader: requireAuth,
		errorElement: <NotFoundPage />,
		children: [
			{ index: true, element: <App /> },
			{ path: "*", element: <NotFoundPage /> },
		],
	},
]);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>
);
