import BusCard from "./BusCard";
import "./BusList.css";

export default function BusList({ buses }) {
  if (!buses || buses.length === 0) {
    return (
      <div className="no-buses">
        <h2>No buses available</h2>
        <p>Please add a new bus to display here.</p>
      </div>
    );
  }

  return (
    <div className="bus-list-container">
      <h2 className="bus-list-title">Available Buses</h2>

      <div className="bus-grid">
        {buses.map((bus) => (
          <BusCard key={bus._id} bus={bus} />
        ))}
      </div>
    </div>
  );
}
