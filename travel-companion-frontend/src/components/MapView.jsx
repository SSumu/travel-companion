import {
  Circle,
  DirectionsRenderer,
  GoogleMap,
  Polyline,
} from "@react-google-maps/api";
import AdvancedUserMarker from "./AdvancedUserMarker";
import { useCallback, useEffect, useRef, useState } from "react";
import "./MapView.css";

const mapContainerStyle = { width: "100%", height: "600px" };

const defaultCenter = { lat: 6.9271, lng: 79.8612 };

export default function MapView({
  origin,
  destination,
  stopValues,
  setRoutePath,
  setFormData,
  setError,
}) {
  // MAP REFS
  const mapRef = useRef(null);
  const watchIdRef = useRef(null);

  // MAP STATES
  const [map, setMap] = useState(null);

  // USER LOCATION
  const [userLocation, setUserLocation] = useState(null);

  //   LOCATION
  const [locating, setLocating] = useState(true);

  //   MAP CENTER
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  // DIRECTIONS
  const [directions, setDirections] = useState(null);

  //   Route Path
  const [localRoutePath, setLocalRoutePath] = useState([]);

  // Save Map Reference | MAP LOAD
  const onLoad = useCallback((mapInstance) => {
    mapRef.current = mapInstance; // still ok for imperative actions
    setMap(mapInstance); // ✅ safe reactive reference
  }, []);

  // LIVE LOCATION TRACKING | Manual button only recenters map (NO setState loop risk) | GO TO CURRENT LOCATION
  const goToCurrentLocation = useCallback(() => {
    if (!userLocation || !mapRef.current) return;

    // UPDATE CENTER STATE
    setMapCenter(userLocation);

    // MOVE MAP
    mapRef.current.panTo(userLocation);

    //   OPTIONAL ZOOM
    mapRef.current.setZoom(15);
  }, [userLocation]);

  //   CLEAR ROUTE
  const clearRoute = useCallback(() => {
    // CLEAR DIRECTIONS
    setDirections(null);

    // CLEAR POLYLINE PATH
    setLocalRoutePath([]);

    // CLEAR PARENT ROUTE PATH
    setRoutePath([]);

    // CLEAR ERRORS
    setError("");

    // OPTIONAL: RESET MAP CENTER TO USER LOCATION
    if (userLocation && mapRef.current) {
      setMapCenter(userLocation);
      mapRef.current.panTo(userLocation);
      mapRef.current.setZoom(15);
    }
  }, [setRoutePath, setError, userLocation]);

  // 🌍 STOP WATCHER ON COMPONENT UNMOUNT | LIVE LOCATION TRACKING | GEOLOCATION WATCHER
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

        // UPDATE MAP CENTER | ONLY CENTER MAP FIRST TIME | SET INITIAL CENTER ONLY ON FIRST LOAD
        setMapCenter((prev) =>
          prev.lat === defaultCenter.lat && prev.lng === defaultCenter.lng
            ? liveLocation
            : prev,
        );

        setLocating(false);
      },
      (error) => {
        console.error("Geolocation Error:", error);

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

  // 🚗 AUTO DRAW ROUTE | ROUTE CALCULATION
  useEffect(() => {
    const calculateRoute = async () => {
      if (!origin || !destination) {
        setDirections(null);
        setLocalRoutePath([]);
        return;
      }

      try {
        const directionsService = new window.google.maps.DirectionsService();

        // GET WAYPOINTS
        const waypoints = stopValues
          .filter((value) => value && value.trim() !== "")
          .map((location) => ({ location, stopover: true }));

        // GET DIRECTIONS | ROUTE REQUEST
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

        // SAVE LOCAL ROUTE
        setLocalRoutePath(route);

        // SAVE TO PARENT
        setRoutePath(route);

        // SAVE TO FORM DATA | SAVE START + END
        setFormData((prev) => ({
          ...prev,
          startLocation: origin,
          endLocation: destination,
        }));

        // FIT MAP TO ROUTE | BOUNDS
        const bounds = new window.google.maps.LatLngBounds();

        results.routes[0].overview_path.forEach((point) =>
          bounds.extend(point),
        );

        // PREVENT CRASH
        if (mapRef.current) mapRef.current.fitBounds(bounds);

        setError("");
      } catch (error) {
        console.error("Directions Error:", error);

        setDirections(null);

        setLocalRoutePath([]);

        setError("Failed to calculate route");
      }
    };

    calculateRoute();
  }, [origin, destination, stopValues, setRoutePath, setFormData, setError]);

  //   // 📍 CENTER MAP ON USER WHEN AVAILABLE
  //   useEffect(() => {
  //     if (!userLocation) return;

  //     setMapCenter((prev) =>
  //       prev.lat === defaultCenter.lat && prev.lng === defaultCenter.lng
  //         ? userLocation
  //         : prev,
  //     );
  //   }, [userLocation]);

  return (
    <>
      {/* LOCATION STATUS */}
      {locating && <p className="location-status">Locating user...</p>}

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
            {map && <AdvancedUserMarker map={map} position={userLocation} />}

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
        {localRoutePath.length > 0 && (
          <Polyline
            path={localRoutePath}
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
  );
}
