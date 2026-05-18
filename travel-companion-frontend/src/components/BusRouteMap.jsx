import { useEffect, useRef, useState } from "react";
import { Polyline, useJsApiLoader } from "@react-google-maps/api";
import PlaceAutocompleteInput from "./PlaceAutocompleteInput";
import FloatingDirectionsPanel from "./FloatingDirectionsPanel";
import MapView from "./MapView";
import AdvancedUserMarker from "./AdvancedUserMarker";
import "./BusRouteMap.css";

export default function BusRouteMap({ formData, setFormData }) {
  // AUTO SEARCH DEBOUNCE
  const debounceRef = useRef(null);

  const libraries = ["places", "marker"];

  // GOOGLE MAPS LOADER
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // FORM STATES (ONLY RESPONSIBILITY OF THIS COMPONENT)
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [stopValues, setStopValues] = useState([]);

  // ROUTE + ERROR (lifted state for MapView)
  const [routePath, setRoutePath] = useState([]);
  const [error, setError] = useState("");

  const [index, setIndex] = useState(0);

  // AUTO SEARCH (DEBOUNCE) | Debounce trigger (MapView handles actual calculation internally via props)
  const debounceCalculateRoute = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {}, 800);
  };

  // ADD STOP FIELD
  const addStopField = () => {
    setStopValues((prev) => [...prev, ""]);
  };

  // REMOVE STOP FIELD
  const removeStopField = (index) => {
    setStopValues((prev) => prev.filter((_, i) => i !== index));
    setTimeout(() => debounceCalculateRoute(), 0);
  };

  // CLEAR ROUTE
  const clearRoute = () => {
    setOrigin("");
    setDestination("");
    setStopValues([]);
    setRoutePath([]);
    setError("");

    setFormData((prev) => ({ ...prev, startLocation: "", endLocation: "" }));
  };

  // USE CURRENT LOCATION AS START
  const setCurrentLocationAsStart = (userLocation) => {
    if (!userLocation) return;

    // const geocoder = new window.google.maps.Geocoder();

    // geocoder.geocode({ location: userLocation }, (results, status) => {
    //   if (status === "OK" && results[0]) {
    //     const address = results[0].formatted_address;

    //     setOrigin(address);

    //     debounceCalculateRoute();
    //   }
    // });

    setOrigin(userLocation);
    debounceCalculateRoute();
  };

  useEffect(() => {
    if (!routePath.length) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % routePath.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [routePath]);

  // RENDER
  return (
    <div className="map-wrapper">
      {!isLoaded ? (
        <p>Loading Map...</p>
      ) : (
        <>
          {/* CONTROL | DIRECTIONS PANEL */}
          <FloatingDirectionsPanel
            // route data
            stopValues={stopValues}
            // setters
            setStopValues={setStopValues}
            setOrigin={setOrigin}
            setDestination={setDestination}
            // handlers
            addStopField={addStopField}
            removeStopField={removeStopField}
            clearRoute={clearRoute}
            setCurrentLocationAsStart={setCurrentLocationAsStart}
            debounceCalculateRoute={debounceCalculateRoute}
            // component
            PlaceAutocompleteInput={PlaceAutocompleteInput}
          />

          {/* ROUTE INFO | SUMMARY */}
          {formData.startLocation && formData.endLocation && (
            <div className="route-summary">
              <p>
                <strong>From:</strong> {formData.startLocation}
              </p>

              <p>
                <strong>To:</strong> {formData.endLocation}
              </p>
            </div>
          )}

          {/* ERROR MESSAGE */}
          {error && <p className="error-text">{error}</p>}

          {/* MAP LAYER (ALL LOGIC INSIDE MAPVIEW) */}
          <MapView
            origin={origin}
            destination={destination}
            stopValues={stopValues}
            setRoutePath={setRoutePath}
            setFormData={setFormData}
            setError={setError}
          />

          <Polyline
            path={routePath}
            options={{ strokeColor: "#1976d2", strokeWeight: 5 }}
          />

          <AdvancedUserMarker position={routePath[index]} />
        </>
      )}
    </div>
  );
}
