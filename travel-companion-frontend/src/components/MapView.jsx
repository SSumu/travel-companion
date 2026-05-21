import { Circle, GoogleMap, Polyline } from "@react-google-maps/api";
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
  // setFormData,
  setError,
  setCalculateRoute,
  setLocalUserLocation,
  externalMapRef,
}) {
  // MAP REFS
  const internalMapRef = useRef(null);
  const watchIdRef = useRef(null);

  // // STORE LATEST ROUTE FUNCTION
  // const calculateRouteRef = useRef(null);

  // STATUS
  // MAP
  const [map, setMap] = useState(null);

  // USER LOCATION
  const [userLocation, setUserLocation] = useState(null);

  //   LOCATION
  const [locating, setLocating] = useState(true);

  //   MAP CENTER
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  // // DIRECTIONS
  // const [directions, setDirections] = useState(null);

  // Route Polyline
  const [routePolyline, setRoutePolyline] = useState([]);

  // //   Route Path
  // const [localRoutePath, setLocalRoutePath] = useState([]);

  // Original Marker
  const [originMarker, setOriginMarker] = useState(null);

  // Destination Marker
  const [destinationMarker, setDestinationMarker] = useState(null);

  // Save Map Reference | MAP LOAD
  const onLoad = useCallback(
    (mapInstance) => {
      internalMapRef.current = mapInstance; // still ok for imperative actions

      if (externalMapRef) externalMapRef.current = mapInstance;

      setMap(mapInstance); // ✅ safe reactive reference
    },
    [externalMapRef],
  );

  // LIVE LOCATION TRACKING | Manual button only recenters map (NO setState loop risk) | GO TO CURRENT LOCATION
  const goToCurrentLocation = useCallback(() => {
    if (!userLocation || !internalMapRef.current) return;

    // UPDATE CENTER STATE
    setMapCenter(userLocation);

    // MOVE MAP
    internalMapRef.current.panTo(userLocation);

    //   OPTIONAL ZOOM
    internalMapRef.current.setZoom(15);
  }, [userLocation]);

  //   CLEAR ROUTE
  const clearRoute = useCallback(() => {
    // // CLEAR POLYLINE PATH
    // setLocalRoutePath([]);

    setRoutePolyline([]);

    // CLEAR PARENT ROUTE PATH
    setRoutePath([]);

    setOriginMarker(null);

    setDestinationMarker(null);

    // CLEAR ERRORS
    setError("");

    // OPTIONAL: RESET MAP CENTER TO USER LOCATION
    if (userLocation && internalMapRef.current) {
      setMapCenter(userLocation);
      internalMapRef.current.panTo(userLocation);
      internalMapRef.current.setZoom(15);
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

        // UPDATE USER LOCATION | SAVE USER LOCATION | Store location locally
        setUserLocation(liveLocation);

        // Send location to BusRouteMap
        if (typeof setLocalUserLocation === "function")
          setLocalUserLocation(liveLocation);

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
  }, [setLocalUserLocation]);

  // 🚗 AUTO DRAW ROUTE | ROUTE CALCULATION
  const calculateRoute = useCallback(async () => {
    console.log("Origin State:", origin);
    console.log("Destination state:", destination);
    console.log("Stops:", stopValues);

    if (!window.google || !internalMapRef.current) {
      setError("Google Maps not loaded");
      return;
    }

    // RESET ROUTE
    // const resetRoute = () => {
    //   setDirections(null);
    //   setLocalRoutePath([]);
    //   setRoutePath([]);
    // };

    // VALIDATION
    if (
      !origin ||
      !destination ||
      typeof origin.lat !== "number" ||
      typeof origin.lng !== "number" ||
      typeof destination.lat !== "number" ||
      typeof destination.lng !== "number"
      // (typeof origin !== "string" && typeof origin !== "object") ||
      // (typeof destination !== "string" && typeof destination !== "object")
      // typeof origin !== "object" ||
      // typeof destination !== "object"
    ) {
      // resetRoute();
      // setDirections(null);
      // setLocalRoutePath([]);
      setRoutePolyline([]);
      setRoutePath([]);

      setOriginMarker(null);
      setDestinationMarker(null);

      setError("Please select valid locations");
      return;
    }

    try {
      // LOAD ROUTES LIBRARY
      // const { Route } = await window.google.maps.importLibrary("routes");
      const directionsService = new window.google.maps.DirectionsService();

      // // CREATE WAYPOINTS
      // const intermediates = stopValues
      //   .filter((value) => value?.trim() !== "")
      //   .map((location) => ({ address: location }));

      // CREATE WAYPOINTS | Previously there was intermediates instead of waypoints
      const waypoints = stopValues
        .filter(
          (location) =>
            location &&
            typeof location.lat === "number" &&
            typeof location.lng === "number",
        )
        // .map((location) => ({
        //   location: {
        //     latLng: { latitude: location.lat, longitude: location.lng },
        //   },
        // }));
        .map((location) => ({
          location: { lat: location.lat, lng: location.lng },
          stopover: true,
        }));

      // COMPUTE ROUTE
      // const result = await Route.computeRoutes({
      //   origin,
      //   destination,
      //   intermediates,
      //   travelMode: "DRIVE",
      // });

      // const result = await Route.computeRoutes({
      //   origin: {
      //     location: { latLng: { latitude: origin.lat, longitude: origin.lng } },
      //   },

      //   destination: {
      //     location: {
      //       latLng: { latitude: destination.lat, longitude: destination.lng },
      //     },
      //   },

      //   intermediates,

      //   travelMode: "DRIVE",

      //   routingPreference: "TRAFFIC_AWARE",

      //   computeAlternativeRoutes: false,
      // });

      // // SAVE DIRECTIONS
      // setDirections(results);

      // ROUTE REQUEST
      const result = await directionsService.route({
        origin,
        destination,
        waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false,
      });

      if (!result.routes || result.routes.length === 0)
        throw new Error("No route found");

      const route = result.routes[0];

      // if (!route.polyline?.encodedPolyline)
      //   throw new Error("No polyline returned");

      // EXTRACT POLYLINE PATH
      const path = route.overview_path.map((point) => ({
        lat: point.lat(),
        lng: point.lng(),
      }));

      // // POLYLINE PATH
      // const path =
      //   route.path?.map((point) => ({ lat: point.lat(), lng: point.lng() })) ||
      //   [];

      // // POLYLINE PATH
      // const decodedPath = window.google.maps.geometry.encoding.decodePath(
      //   route.polyline.encodedPolyline,
      // );

      // const path = decodedPath.map((point) => ({
      //   lat: point.lat(),
      //   lng: point.lng(),
      // }));

      // // SAVE LOCAL ROUTE
      // setLocalRoutePath(route);

      // SAVE ROUTE
      setRoutePolyline(path);
      setRoutePath(path); // SAVE TO PARENT

      // START LOCATION | START MARKER
      const firstLeg = route.legs[0];

      setOriginMarker({
        // lat: firstLeg.startLocation.latLng.latitude,
        // lng: firstLeg.startLocation.latLng.longitude,
        lat: firstLeg.start_location.lat(),
        lng: firstLeg.start_location.lng(),
      });

      // END LOCATION | END MARKER
      const lastLeg = route.legs[route.legs.length - 1];

      setDestinationMarker({
        // lat: lastLeg.endLocation.latLng.latitude,
        // lng: lastLeg.endLocation.latLng.longitude,
        lat: lastLeg.end_location.lat(),
        lng: lastLeg.end_location.lng(),
      });

      // FIT MAP TO ROUTE | BOUNDS
      const bounds = new window.google.maps.LatLngBounds();

      path.forEach((point) => bounds.extend(point));

      internalMapRef.current.fitBounds(bounds);

      // CLEAR ERROR
      setError("");
    } catch (error) {
      console.error("Directions Error:", error);

      // setDirections(null);
      // setLocalRoutePath([]);
      setRoutePolyline([]);
      setRoutePath([]);

      // resetRoute();

      setError("Failed to calculate route");
    }
  }, [origin, destination, stopValues, setRoutePath, setError]);

  // Register the function
  // Prevent infinite loop by NOT depending on calculateRoute

  // KEEP ROUTE FUNCTION UPDATED
  useEffect(() => {
    // calculateRouteRef.current = calculateRoute;
    if (typeof setCalculateRoute === "function")
      setCalculateRoute(calculateRoute);
  }, [calculateRoute, setCalculateRoute]);

  // // AUTO DRAW ROUTE | AUTO ROUTE CALCULATION
  // useEffect(() => {
  //   if (!origin || !destination) return;

  //   const timer = setTimeout(() => {
  //     calculateRoute();
  //   }, 0);

  //   return () => clearTimeout(timer);
  // }, [origin, destination, calculateRoute]);

  //   return () => clearTimeout(timer);
  // }, [origin, destination, calculateRoute]);

  //   // 📍 CENTER MAP ON USER WHEN AVAILABLE
  //   useEffect(() => {
  //     if (!userLocation) return;

  //     setMapCenter((prev) =>
  //       prev.lat === defaultCenter.lat && prev.lng === defaultCenter.lng
  //         ? userLocation
  //         : prev,
  //     );
  //   }, [userLocation]);

  // UI
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

        {/* YOUR ROUTE PATH POLYLINE | CUSTOM POLYLINE | ROUTE LINE (ONLY ONE SOURCE OF TRUTH) */}
        {/* {localRoutePath.length > 0 && (
          <Polyline
            path={localRoutePath}
            options={{ strokeColor: "#1976d2", strokeWeight: 5 }}
          />
        )} */}

        {/* START MARKER */}
        {originMarker && (
          <AdvancedUserMarker position={originMarker} label="A" />
        )}

        {/* DESTINATION MARKER */}
        {destinationMarker && (
          <AdvancedUserMarker position={destinationMarker} label="B" />
        )}

        {/* Route Polyline | ROUTE | GOOGLE DIRECTIONS */}
        {routePolyline.length > 0 && (
          <Polyline
            path={routePolyline}
            options={{
              strokeColor: "#1976d2",
              strokeWeight: 5,
              strokeOpacity: 0.9,
              geodesic: true,
            }}
          />
        )}
      </GoogleMap>
    </>
  );
}
