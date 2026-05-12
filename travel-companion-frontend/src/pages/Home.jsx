import { useEffect, useState } from "react";
import { getAllBuses } from "../services/busService";
import BusList from "../components/BusList";
import "./Home.css";

export default function Home() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadBuses = async () => {
      try {
        setLoading(true);

        const data = await getAllBuses();

        setBuses(data);
      } catch (error) {
        console.error("Failed to fetch buses:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBuses();
  }, []);

  const refreshBuses = async () => {
    try {
      setLoading(true);

      const data = await getAllBuses();

      setBuses(data);
    } catch (error) {
      console.error("Failed to refresh buses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBuses = buses.filter((bus) =>
    `${bus.busNumber} ${bus.roadName} ${bus.startLocation} ${bus.endLocation}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="overlay">
          <h1>Bus Tracking & Schedule System</h1>

          <p>
            Track buses, check schedules, monitor routes, and view operating
            status in real time
          </p>

          <input
            type="text"
            placeholder="Search by bus number, route, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-box"
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-container">
        <div className="stat-card">
          <h2>{buses.length}</h2>
          <p>Total Buses</p>
        </div>

        <div className="stat-card running">
          <h2>{buses.filter((bus) => bus.status === "Running").length}</h2>
          <p>Running</p>
        </div>

        <div className="stat-card faulty">
          <h2>{buses.filter((bus) => bus.status === "Faulty").length}</h2>
          <p>Faulty</p>
        </div>
      </div>

      {/* Bus List */}
      <div className="bus-section">
        <div className="section-header">
          <h2>Available Buses</h2>

          <button onClick={refreshBuses}>Refresh</button>
        </div>

        {loading ? (
          <div className="loading">Loading buses...</div>
        ) : filteredBuses.length > 0 ? (
          <BusList buses={filteredBuses} reload={refreshBuses} />
        ) : (
          <div className="no-bus">No buses found matching your search.</div>
        )}
      </div>
    </div>
  );
}
