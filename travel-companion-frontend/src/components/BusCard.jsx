import { Link } from "react-router-dom";
import "./BusCard.css";

export default function BusCard({ bus }) {
  return (
    <div className="bus-card">
      <div className="bus-card-header">
        <h2>{bus.busNumber}</h2>

        <span
          className={`status-badge ${bus.status === "Running" ? "running" : bus.status === "Faulty" ? "faulty" : "stopped"}`}
        >
          {bus.status}
        </span>
      </div>

      <div className="bus-card-body">
        <p>
          <strong>Road:</strong> {bus.roadName}
        </p>

        <p>
          <strong>Driver:</strong> {bus.driverName}
        </p>

        {/* <p>
        <strong>Status:</strong> {bus.status}
      </p> */}

        <p>
          <strong>Operating Time:</strong> {bus.operatingFrom} -{" "}
          {bus.operatingTo}
        </p>

        <p>
          <strong>Interval:</strong> Every {bus.intervalMinutes} minutes
        </p>
      </div>

      <div className="bus-card-footer">
        <Link to={`/route/${bus._id}`}>
          <button className="route-btn">View Route</button>
        </Link>
      </div>
    </div>
  );
}
