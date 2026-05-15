import { useEffect, useRef } from "react";

export default function AdvancedUserMarker({ map, position }) {
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map || !position || !window.google) return;

    let isMounted = true;

    const createMarker = async () => {
      const { AdvancedMarkerElement } =
        await window.google.maps.importLibrary("marker");

      if (!isMounted) return;

      // Remove previous marker
      if (markerRef.current) markerRef.current.map = null;

      // Create custom HTML marker
      const el = document.createElement("div");

      el.style.width = "18px";
      el.style.height = "18px";
      el.style.borderRadius = "50%";
      el.style.background = "#4285f4";
      el.style.border = "3px solid white";
      el.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";

      // Create Advanced Marker
      markerRef.current = new AdvancedMarkerElement({
        map,
        position,
        content: el,
      });
    };

    createMarker();

    return () => {
      isMounted = false;

      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
    };
  }, [map, position]);

  return null;
}
