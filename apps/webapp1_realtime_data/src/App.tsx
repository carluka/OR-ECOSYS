import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./layout//Layout";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/login/LoginPage";
import NotFoundPage from "./pages/notFound/NotFoundPage";
import { requireAuth } from "./auth";
import OperationRoomPage from "./pages/operationRoom/OperationRoomPage";
import "./App.css";
import PatientDetailsPage from "./pages/patientDetail/PatientDetailsPage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    loader: requireAuth,
    errorElement: <NotFoundPage />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "/operation", element: <OperationRoomPage /> },
          { path: "/patients", element: <PatientsPage /> },
          { path: "/patients/:id", element: <PatientDetailsPage /> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
