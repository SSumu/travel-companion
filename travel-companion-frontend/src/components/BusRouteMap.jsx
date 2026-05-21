import { useCallback, useEffect, useRef, useState } from "react";
import { /*Polyline,*/ useJsApiLoader } from "@react-google-maps/api";
import PlaceAutocompleteInput from "./PlaceAutocompleteInput";
import FloatingDirectionsPanel from "./FloatingDirectionsPanel";
import MapView from "./MapView";
import AdvancedUserMarker from "./AdvancedUserMarker";
import "./BusRouteMap.css";

export default function BusRouteMap({ formData, setFormData }) {
  // GOOGLE LIBRARIES
  const libraries = ["places", "marker", "routes", "geometry"];

  // GOOGLE MAPS LOADER
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // FORM STATES (ONLY RESPONSIBILITY OF THIS COMPONENT)
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [stopValues, setStopValues] = useState([]);

  // ROUTE + ERROR (lifted state for MapView)
  const [routePath, setRoutePath] = useState([]);
  const [error, setError] = useState("");

  // Prevents stale function reference issues
  const [calculateRouteFn, setCalculateRouteFn] = useState(null);

  // Store live user location
  const [userLocation, setUserLocation] = useState(null);

  // INDEX FOR ANIMATION
  const [index, setIndex] = useState(0);

  // AUTO SEARCH DEBOUNCE HANDLER
  const debounceRef = useRef(null);

  // Store calculateRoute function from MapView and useRef instead of useState for function sharing
  const calculateRouteRef = useRef(null);

  // MAP REF
  const mapRef = useRef(null);

  // STABLE FUNCTION REFERENCE
  const handleSetCalculateRoute = useCallback((func) => {
    setCalculateRouteFn(() => func);
  }, []);

  // KEEP LATEST FUNCTION
  useEffect(() => {
    calculateRouteRef.current = calculateRouteFn;
  }, [calculateRouteFn]);

  // AUTO SEARCH (DEBOUNCE) | Debounce trigger (MapView handles actual calculation internally via props) | Stable debounce route calculation
  const debounceCalculateRoute = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (typeof calculateRouteRef.current === "function")
        calculateRouteRef.current();
      // if (typeof calculateRouteFn === "function") calculateRouteFn();
    }, 800);
  }, []);

  // GO TO CURRENT LOCATION
  const goToCurrentLocation = useCallback(() => {
    if (!userLocation || !mapRef.current) return;

    mapRef.current.panTo(userLocation);
    mapRef.current.setZoom(15);
  }, [userLocation]);

  // ADD STOP FIELD
  const addStopField = () => {
    setStopValues((prev) => [...prev, ""]);
  };

  // REMOVE STOP FIELD
  const removeStopField = (removeIndex) => {
    setStopValues((prev) => prev.filter((_, index) => index !== removeIndex));

    // setTimeout(() => debounceCalculateRoute(), 0);

    setTimeout(() => {
      if (typeof calculateRouteFn === "function") calculateRouteFn();
    }, 0);
  };

  // CLEAR ROUTE
  const clearRoute = () => {
    setOrigin(null);
    setDestination(null);
    setStopValues([]);
    setRoutePath([]);
    setError("");

    setFormData((prev) => ({ ...prev, startLocation: "", endLocation: "" }));
  };

  // USE CURRENT LOCATION AS START | Uses actual user location safely
  const setCurrentLocationAsStart = useCallback(() => {
    if (!userLocation) {
      setError("User location not available");
      return;
    }

    // const geocoder = new window.google.maps.Geocoder();

    // geocoder.geocode({ location: userLocation }, (results, status) => {
    //   if (status === "OK" && results[0]) {
    //     const address = results[0].formatted_address;

    //     setOrigin(address);

    //     debounceCalculateRoute();
    //   }
    // });

    // Google Directions API accepts LatLng object
    setOrigin(userLocation);

    debounceCalculateRoute();
  }, [userLocation, debounceCalculateRoute]);

  // AUTO UPDATE ROUTE ANIMATION INDEX
  useEffect(() => {
    if (!routePath.length) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % routePath.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [routePath]);

  // RENDER UI
  return (
    <div className="map-wrapper">
      {!isLoaded ? (
        <p>Loading Map...</p>
      ) : (
        <>
          {/* CONTROL | DIRECTIONS PANEL | FLOATING PANEL */}
          <FloatingDirectionsPanel
            // route data
            stopValues={stopValues}
            error={error}
            // setters
            setOrigin={setOrigin}
            setDestination={setDestination}
            setStopValues={setStopValues}
            // handlers
            addStopField={addStopField}
            removeStopField={removeStopField}
            clearRoute={clearRoute}
            setCurrentLocationAsStart={setCurrentLocationAsStart}
            goToCurrentLocation={goToCurrentLocation}
            debounceCalculateRoute={debounceCalculateRoute}
            // calculateRoute={() => mapCalculateRouteRef.current?.()}

            // calculateRoute={() => calculateRouteFn?.()}

            calculateRoute={calculateRouteFn}
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

          {/* MAP LAYER (ALL LOGIC INSIDE MAPVIEW) */}
          <MapView
            origin={origin}
            destination={destination}
            stopValues={stopValues}
            setRoutePath={setRoutePath}
            setFormData={setFormData}
            setError={setError}
            // setCalculateRoute={(func) => {
            //   // Stable function storage
            //   mapCalculateRouteRef.current = func;
            // }}
            // setCalculateRoute={(func) => setCalculateRouteFn(() => func)}
            setCalculateRoute={handleSetCalculateRoute}
            setLocalUserLocation={setUserLocation}
            externalMapRef={mapRef}
          />

          {/* EXTRA POLYLINE (optional duplicate visual) */}
          {/* <Polyline
            path={routePath}
            options={{ strokeColor: "#1976d2", strokeWeight: 5 }}
          /> */}

          {/* LIVE MARKER ANIMATION */}
          {routePath.length > 0 && (
            <AdvancedUserMarker position={routePath[index]} />
          )}

          {/* ERROR MESSAGE | DISPLAY */}
          {error && <p className="error-text">{error}</p>}
        </>
      )}
    </div>
  );
}
