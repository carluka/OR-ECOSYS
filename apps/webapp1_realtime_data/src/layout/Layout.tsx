import { Link, Outlet } from "react-router-dom";
import "./Layout.css";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { Button } from "@mui/material";

const Layout = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    api.post("/users/logout");
    navigate("/login");
  };
  return (
    <div className="layout">
      <header className="header">
        <nav className="nav">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/operation" className="nav-link">
            Operation Room
          </Link>
          <Link to="/patients" className="nav-link">
            Patients
          </Link>
        </nav>
        <Button onClick={handleLogout}>Sign out</Button>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
