import BusForm from "../components/BusForm";
import "./AddBus.css";

export default function AddBus() {
  return (
    <div className="addbus-page">
      <div className="addbus-container">
        <div className="addbus-header">
          <h1>Add New Bus</h1>
          <p>
            Register a new bus with route details, operating times, and status.
          </p>
        </div>

        <BusForm />
      </div>
    </div>
  );
}
