import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <h2>🚌 Bus Tracking System</h2>
      </div>

      <div className="navbar-links">
        <Link to="/" className={location.pathname === "/" ? "active" : ""}>
          Home
        </Link>

        <Link
          to="/add-bus"
          className={location.pathname === "/add-bus" ? "active" : ""}
        >
          Add Bus
        </Link>
      </div>
    </nav>
  );
}
