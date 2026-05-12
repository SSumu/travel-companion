import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AddBus from "./pages/AddBus";
import RouteDetails from "./pages/RouteDetails";
import "./App.css";

export default function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add-bus" element={<AddBus />} />
            <Route path="/route/:id" element={<RouteDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
