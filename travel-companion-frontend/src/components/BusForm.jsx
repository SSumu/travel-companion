import { useState } from "react";
import { createBus } from "../services/busService";
import "./BusForm.css";
import BusRouteMap from "./BusRouteMap";

export default function BusForm() {
  // STATES
  const [routePath, setRoutePath] = useState([]); // ROUTE PATH
  const [loading, setLoading] = useState(false); // LOADING
  const [message, setMessage] = useState(""); // SUCCESS MESSAGE
  const [error, setError] = useState(""); // ERROR MESSAGE

  // FORM DATA
  const [formData, setFormData] = useState({
    busNumber: "",
    driverName: "",
    roadName: "",
    startLocation: "",
    endLocation: "",
    operatingFrom: "",
    operatingTo: "",
    intervalMinutes: 30,
    status: "Running",
  });

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // HANDLE SUBMIT FORM
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // VALIDATE ROUTE
      if (!routePath.length) {
        setError("Please create a route first");
        return;
      }

      setLoading(true);

      setMessage("");

      setError("");

      // PAYLOAD
      const payload = {
        ...formData,

        intervalMinutes: Number(formData.intervalMinutes),

        routeCoordinates: routePath,
      };

      // API CALL
      await createBus(payload);

      setMessage("Bus Added Successfully!");

      // RESET FORM
      setFormData({
        busNumber: "",
        driverName: "",
        roadName: "",
        startLocation: "",
        endLocation: "",
        operatingFrom: "",
        operatingTo: "",
        intervalMinutes: 30,
        status: "Running",
      });

      // RESET ROUTE
      setRoutePath([]);
    } catch (error) {
      console.log(error);

      setError(error.response?.data?.message || "Failed to add bus");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bus-form-container">
      <form className="bus-form" onSubmit={handleSubmit}>
        <h2>Add New Bus</h2>

        {/* SUCCESS MESSAGE */}
        {message && <div className="success-message">{message}</div>}

        {/* ERROR MESSAGE */}
        {error && <div className="error-message">{error}</div>}

        {/* FORM INPUTS */}

        {/* BUS NUMBER */}
        <div className="form-group">
          <label>Bus Number</label>

          <input
            type="text"
            name="busNumber"
            placeholder="Enter bus number"
            value={formData.busNumber}
            onChange={handleChange}
            required
          />
        </div>

        {/* DRIVER NAME */}
        <div className="form-group">
          <label>Driver Name</label>

          <input
            type="text"
            name="driverName"
            placeholder="Enter driver name"
            value={formData.driverName}
            onChange={handleChange}
            required
          />
        </div>

        {/* ROAD NAME */}
        <div className="form-group">
          <label>Road Name</label>

          <input
            type="text"
            name="roadName"
            placeholder="Enter road name"
            value={formData.roadName}
            onChange={handleChange}
            required
          />
        </div>

        {/* OPERATING FROM */}
        <div className="form-group">
          <label>Operating From</label>

          <input
            type="time"
            name="operatingFrom"
            value={formData.operatingFrom}
            onChange={handleChange}
            required
          />
        </div>

        {/* OPERATING TO */}
        <div className="form-group">
          <label>Operating To</label>

          <input
            type="time"
            name="operatingTo"
            value={formData.operatingTo}
            onChange={handleChange}
            required
          />
        </div>

        {/* INTERVAL */}
        <div className="form-group">
          <label>Interval Minutes</label>

          <input
            type="number"
            name="intervalMinutes"
            placeholder="30"
            value={formData.intervalMinutes}
            onChange={handleChange}
            required
          />
        </div>

        {/* STATUS */}
        <div className="form-group">
          <label>Bus Status</label>

          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="Running">Running</option>
            <option value="Faulty">Faulty</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>

        {/* Map Section */}

        {/* GOOGLE MAP */}
        <div className="form-group">
          <label>Route Map</label>

          <BusRouteMap
            routePath={routePath}
            setRoutePath={setRoutePath}
            formData={formData}
            setFormData={setFormData}
          />
        </div>

        {/* SUBMIT BUTTON */}
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Adding Bus..." : "Add Bus"}
        </button>
      </form>
    </div>
  );
}
