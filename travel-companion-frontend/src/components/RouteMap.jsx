import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./RouteMap.css";

// Fix marker icon issue in React + Vite
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function RouteMap({ routeCoordinates = [] }) {
  // Default center (Sri Lanka)
  const defaultCenter = [7.8731, 80.7718];

  // Convert string coordinates to numbers
  const positions = routeCoordinates.map((coord) => [
    Number(coord.lat),
    Number(coord.lng),
  ]);

  const center = positions.length > 0 ? positions[0] : defaultCenter;

  return (
    <div className="route-map-container">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={true}
        className="route-map"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route Line */}
        {positions.length > 0 && <Polyline positions={positions} />}

        {/* Start Marker */}
        {positions.length > 0 && (
          <Marker position={positions[0]}>
            <Popup>Bus Route Start</Popup>
          </Marker>
        )}

        {/* End Marker */}
        {positions.length > 1 && (
          <Marker position={positions[positions.length - 1]}>
            <Popup>Bus Route End</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
