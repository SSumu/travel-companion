import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getBusById } from "../services/busService";
import RouteMap from "../components/RouteMap";
import "./RouteDetails.css";

export default function RouteDetails() {
  const { id } = useParams();

  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBus = async () => {
      try {
        const response = await getBusById(id);
        setBus(response.data);
      } catch (error) {
        console.error("Error fetching bus:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBus();
  }, [id]);

  if (loading) {
    return (
      <div className="route-details-loading">Loading route details...</div>
    );
  }

  if (!bus) {
    return <div className="route-details-error">Bus not found.</div>;
  }

  return (
    <div className="route-details-container">
      <div className="route-header">
        <div>
          <h1>{bus.busNumber}</h1>
          <p className="road-name">{bus.roadName}</p>
        </div>

        <span
          className={`status-badge ${bus.status === "Running" ? "running" : "faulty"}`}
        >
          {bus.status}
        </span>
      </div>

      <div className="route-info-grid">
        <div className="info-card">
          <h3>Driver</h3>
          <p>{bus.driverName}</p>
        </div>

        <div className="info-card">
          <h3>Start Location</h3>
          <p>{bus.startLocation}</p>
        </div>

        <div className="info-card">
          <h3>End Location</h3>
          <p>{bus.endLocation}</p>
        </div>

        <div className="info-card">
          <h3>Operating Time</h3>
          <p>
            {bus.operatingFrom} - {bus.operatingTo}
          </p>
        </div>

        <div className="info-card">
          <h3>Bus Interval</h3>
          <p>Every {bus.intervalMinutes} minutes</p>
        </div>
      </div>

      <div className="map-section">
        <h2>Bus Route Map</h2>

        <RouteMap
          routeCoordinates={bus.routeCoordinates}
          startLocation={bus.startLocation}
          endLocation={bus.endLocation}
        />
      </div>

      <div className="back-button-container">
        <Link to="/" className="back-button">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
