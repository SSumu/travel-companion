import { useCallback, useEffect, useRef, useState } from "react";
import {
  Circle,
  DirectionsRenderer,
  GoogleMap,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";
import "./BusRouteMap.css";
import PlaceAutocompleteInput from "./PlaceAutocompleteInput";
import AdvancedUserMarker from "./AdvancedUserMarker";

const mapContainerStyle = { width: "100%", height: "600px" };

const defaultCenter = { lat: 6.9271, lng: 79.8612 };

export default function BusRouteMap({
  routePath,
  setRoutePath,
  formData,
  setFormData,
}) {
  // MAP REFS
  const mapRef = useRef(null);
  const watchIdRef = useRef(null);

  const libraries = ["places", "marker"];

  // LOAD GOOGLE MAPS
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // STATES
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [stops, setStops] = useState([""]);
  const [stopValues, setStopValues] = useState([]);

  const [map, setMap] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [userLocation, setUserLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [locating, setLocating] = useState(true);
  const [error, setError] = useState("");

  // Save Map Reference | MAP LOAD
  const onLoad = useCallback((mapInstance) => {
    mapRef.current = mapInstance; // still ok for imperative actions
    setMap(mapInstance); // ✅ safe reactive reference
  }, []);

  // AUTO DRAW ROUTE | ROUTE CALCULATION
  const calculateRoute = async () => {
    if (!origin || destination) return;

    try {
      const directionsService = new window.google.maps.DirectionsService();

      // GET WAYPOINTS
      const waypoints = stopValues
        .filter((value) => value && value.trim() !== "")
        .map((location) => ({ location, stopover: true }));

      // GET DIRECTIONS
      const results = await directionsService.route({
        origin,
        destination,
        waypoints,
        optimizeWaypoints: false,
        travelMode: window.google.maps.TravelMode.DRIVING,
      });

      // SAVE DIRECTIONS
      setDirections(results);

      // SAVE OR BUILD ROUTE PATH
      const route = results.routes[0].overview_path.map((point) => ({
        lat: point.lat(),
        lng: point.lng(),
      }));

      setRoutePath(route);

      // SAVE TO FORM DATA | SAVE START + END
      setFormData((prev) => ({
        ...prev,
        startLocation: origin,
        endLocation: destination,
      }));

      // FIT MAP TO ROUTE
      const bounds = new window.google.maps.LatLngBounds();

      results.routes[0].overview_path.forEach((point) => bounds.extend(point));

      // PREVENT CRASH
      if (mapRef.current) mapRef.current.fitBounds(bounds);
    } catch (error) {
      console.log("Directions Error:", error);

      setError("Failed to calculate route");
    }
  };

  // ADD STOP FIELD
  const addStopField = () => {
    setStops((prev) => [...prev, ""]);
    setStopValues((prev) => [...prev, ""]);
  };

  // REMOVE STOP FIELD
  const removeStopField = (index) => {
    setStops((prev) => prev.filter((_, i) => i !== index));
    setStopValues((prev) => prev.filter((_, i) => i !== index));

    setTimeout(() => calculateRoute(), 0);
  };

  // CLEAR ROUTE
  const clearRoute = () => {
    setOrigin("");
    setDestination("");
    setStops([""]);
    setStopValues([]);
    setDirections(null);
    setRoutePath([]);
    setError("");
  };

  // LIVE LOCATION TRACKING | Manual button only recenters map (NO setState loop risk) | GO TO CURRENT LOCATION
  const goToCurrentLocation = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.panTo(userLocation);
      mapRef.current.setZoom(15);
    }
  }, [userLocation]);

  // STOP WATCHER ON COMPONENT UNMOUNT | LIVE LOCATION TRACKING | GEOLOCATION WATCHER
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const liveLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // UPDATE USER LOCATION | SAVE USER LOCATION
        setUserLocation(liveLocation);

        // UPDATE MAP CENTER | ONLY CENTER MAP FIRST TIME
        setMapCenter((prev) =>
          prev.lat === defaultCenter.lat && prev.lng === defaultCenter.lng
            ? liveLocation
            : prev,
        );

        setLocating(false);
      },
      (error) => {
        console.log("Geolocation Error:", error);

        setLocating(false);

        if (error.code === 1) alert("Location permission denied");
        else if (error.code === 2) alert("Location unavailable");
        else if (error.code === 3) alert("Location request timed out");
        else alert("Unable to get location");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );

    // CLEANUP
    return () => {
      if (watchIdRef.current)
        navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  return (
    <div className="map-wrapper">
      {!isLoaded ? (
        <p>Loading Map...</p>
      ) : (
        <>
          {/* MAP CONTROL BUTTONS */}
          <div className="map-buttons">
            <button
              type="button"
              className="location-btn"
              onClick={goToCurrentLocation}
              disabled={locating}
            >
              {locating ? "Locating..." : "Track My Live Location"}
            </button>

            <button type="button" className="clear-btn" onClick={clearRoute}>
              Clear Route
            </button>
          </div>

          {/* DIRECTIONS PANEL | FLOATING DIRECTIONS PANEL | ROUTE PANEL */}
          <div className="gmaps-route-box">
            {/* START */}
            <div className="route-input-item">
              <PlaceAutocompleteInput
                placeholder="Choose starting point"
                onPlaceSelect={(place) => {
                  console.log(place);

                  const value =
                    place.formattedAddress || place.displayName || "";

                  setOrigin(value);
                  calculateRoute();
                }}
              />
            </div>

            {/* STOPS */}
            {stops.map((_, index) => (
              <div key={index} className="route-input-item">
                <PlaceAutocompleteInput
                  placeholder={`Add stop ${index + 1}`}
                  onPlaceSelect={(place) => {
                    console.log(place);

                    const value =
                      place.formattedAddress || place.displayName || "";

                    setStopValues((prev) => {
                      const updated = [...prev];
                      updated[index] = value;
                      return updated;
                    });
                    calculateRoute();
                  }}
                />

                <button
                  type="button"
                  className="remove-stop-btn"
                  onClick={() => removeStopField(index)}
                >
                  ✕
                </button>
              </div>
            ))}

            {/* DESTINATION */}
            <div className="route-input-item">
              <PlaceAutocompleteInput
                placeholder="Choose destination"
                onPlaceSelect={(place) => {
                  console.log(place);

                  const value =
                    place.formattedAddress || place.displayName || "";

                  setDestination(value);
                  calculateRoute();
                }}
              />
            </div>

            {/* ACTION BUTTONS */}
            <div className="route-actions">
              <button type="button" onClick={addStopField}>
                + Add Stop
              </button>

              <button type="button" onClick={goToCurrentLocation}>
                {locating ? "Locating..." : "My Location"}
              </button>

              <button type="button" onClick={clearRoute}>
                Clear
              </button>
            </div>

            {error && <p className="map-error">{error}</p>}
          </div>

          {/* ROUTE INFO */}
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

          {/* GOOGLE MAP */}
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={12}
            center={mapCenter}
            onLoad={onLoad}
            options={{
              mapId: import.meta.env.VITE_GOOGLE_MAP_ID, // ✅ REQUIRED for Advanced Markers
              fullscreenControl: true,
              streetViewControl: true,
              mapTypeControl: true,
              zoomControl: true,
            }}
          >
            {/* USER LOCATION DOT | USER LIVE LOCATION */}
            {userLocation && (
              <>
                {map && (
                  <AdvancedUserMarker map={map} position={userLocation} />
                )}

                <Circle
                  center={userLocation}
                  radius={50}
                  options={{
                    fillColor: "#4285f4",
                    fillOpacity: 0.2,
                    strokeColor: "#4285f4",
                    strokeOpacity: 0.4,
                    strokeWeight: 1,
                  }}
                />
              </>
            )}

            {/* YOUR ROUTE PATH POLYLINE */}
            {routePath.length > 0 && (
              <Polyline
                path={routePath}
                options={{ strokeColor: "#1976d2", strokeWeight: 5 }}
              />
            )}

            {/* ROUTE */}
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  suppressMarkers: false,
                  polylineOptions: {
                    strokeColor: "#1976d2",
                    strokeWeight: 5,
                  },
                }}
              />
            )}
          </GoogleMap>
        </>
      )}
    </div>
  );
}
