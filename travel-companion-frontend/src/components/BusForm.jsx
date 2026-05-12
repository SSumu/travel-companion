import { useState } from "react";
import { createBus } from "../services/busService";
import "./BusForm.css";

export default function BusForm() {
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
    routeCoordinates: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /*
    CONVERT COORDINATES STRING TO ARRAY
    Example:
    6.9271,79.8612
    6.9371,79.8712
  */
  const parseCoordinates = (text) => {
    if (!text.trim()) return [];

    return text
      .split("\n")
      .map((line) => {
        const [lat, lng] = line.split(",");

        return { lat: Number(lat.trim()), lng: Number(lng.trim()) };
      })
      .filter((coord) => !isNaN(coord.lat) && !isNaN(coord.lng));
  };

  //  SUBMIT FORM
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const payload = {
        ...formData,
        intervalMinutes: Number(formData.intervalMinutes),
        routeCoordinates: parseCoordinates(formData.routeCoordinates),
      };

      await createBus(payload);

      // alert('Bus Added Successfully')

      setMessage("Bus Added Successfully!");

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
        routeCoordinates: "",
      });
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

        {message && <div className="success-message">{message}</div>}

        {error && <div className="error-message">{error}</div>}

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

        {/* START LOCATION */}
        <div className="form-group">
          <label>Start Location</label>

          <input
            type="text"
            name="startLocation"
            placeholder="Enter start location"
            value={formData.startLocation}
            onChange={handleChange}
            required
          />
        </div>

        {/* END LOCATION */}
        <div className="form-group">
          <label>End Location</label>

          <input
            type="text"
            name="endLocation"
            placeholder="Enter end location"
            value={formData.endLocation}
            onChange={handleChange}
            required
          />
        </div>

        {/* OPERATING FROM */}
        <div className="form-group">
          <label>Operating Form</label>

          <input
            type="time"
            name="operatingForm"
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

        {/* ROUTE COORDINATES */}
        <div className="form-group">
          <label>Route Coordinates</label>

          <textarea
            name="routeCoordinates"
            rows="6"
            placeholder={`Example:
                6.9271,79.8612
                6.9371,79.8712
                6.9471,79.8812`}
            value={formData.routeCoordinates}
            onChange={handleChange}
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
