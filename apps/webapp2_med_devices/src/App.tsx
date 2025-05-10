import "./App.css";
import Login from "./components/authentication/Login";
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
	const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
	return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const handleLogout = () => {
		localStorage.removeItem("isAuthenticated");
		localStorage.removeItem("userEmail");
		setIsAuthenticated(false);
	};

	// Check authentication status on component mount
	useEffect(() => {
		const auth = localStorage.getItem("isAuthenticated");
		if (auth === "true") {
			setIsAuthenticated(true);
		}
	}, []);

	return (
		<Routes>
			<Route
				path="/login"
				element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
			/>
			<Route
				path="/"
				element={
					<ProtectedRoute>
						<div className="main-container">
							<div className="main-container-left">
								<div className="header">
									<h1>Medicinske naprave</h1>
								</div>
								<div className="navigation">
									<h1>Navigation</h1>
								</div>
							</div>
							<div className="main-container-right">
								<div className="login-logout">
									<button onClick={handleLogout}>Odjava</button>
								</div>
								<div className="content">
									<h1>Content</h1>
								</div>
							</div>
						</div>
					</ProtectedRoute>
				}
			/>
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

export default App;
