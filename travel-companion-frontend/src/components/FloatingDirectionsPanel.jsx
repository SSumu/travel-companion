import { /*useEffect,*/ useRef, useState } from "react";
import "./FloatingDirectionsPanel.css";

export default function FloatingDirectionsPanel({
  //   route data
  stopValues,
  locating,
  error,

  //   handlers
  setCurrentLocationAsStart,
  addStopField,
  removeStopField,
  goToCurrentLocation,
  clearRoute,
  calculateRoute,
  debounceCalculateRoute,

  //   setters
  setOrigin,
  setDestination,
  setStopValues,

  //   component
  PlaceAutocompleteInput,
}) {
  // PANEL STATE (NEW)
  const [panelExpanded, setPanelExpanded] = useState(false);

  // PANEL REFS
  const panelRef = useRef(null);

  // DRAGGING
  const dragStart = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false); // DRAGGING REF

  // 🔥 Draggable panel
  const [panelPos, setPanelPos] = useState({ x: 20, y: 80 });
  const [isDragging, setIsDragging] = useState(false);

  // INPUT INTERACTION LOCK
  const [isFocused, setIsFocused] = useState(false);
  const [hasInputValue, setHasInputValue] = useState(false);

  // DRAG LOGIC | PANEL DRAGGING
  // POINTER DOWN
  const onPointerDown = (e) => {
    isDraggingRef.current = true;

    setIsDragging(true);

    dragStart.current = {
      x: e.clientX - panelPos.x,
      y: e.clientY - panelPos.y,
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  // POINTER MOVE
  const onPointerMove = (e) => {
    setPanelPos({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  // POINTER UP
  const onPointerUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);

    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  };

  // useEffect(() => {
  //   const onFocus = () => setPanelExpanded(true);

  //   const onBlur = () => {
  //     // Optional: only collapse if user is not hovering or dragging
  //     setTimeout(() => {
  //       const isHovering = panelRef.current?.matches(":hover");
  //       const isDraggingNow = isDraggingRef.current;

  //       if (!isHovering && !isDraggingNow);
  //       false;
  //     }, 150);
  //   };

  //   window.addEventListener("route-panel-focus", onFocus);
  //   window.addEventListener("route-panel-blur", onBlur);

  //   return () => {
  //     window.removeEventListener("route-panel-focus", onFocus);
  //     window.removeEventListener("route-panel-blur", onBlur);
  //   };
  // }, []);

  return (
    // DIRECTIONS PANEL | FLOATING DIRECTIONS PANEL | ROUTE PANEL | DRAGGABLE PANEL (CUSTOM)
    <div
      ref={panelRef}
      className={`gmaps-route-box ${panelExpanded ? "expanded" : "collapsed"}`}
      style={{
        top: panelPos.y,
        left: panelPos.x,
        cursor: isDragging ? "grabbing" : "default",
        //   width: panelExpanded ? "350px" : "200px",
        //   maxHeight: panelExpanded ? "380px" : "170px",
        //   overflowY: panelExpanded ? "auto" : "hidden",
      }}
      onMouseEnter={() => setPanelExpanded(true)}
      onMouseLeave={() => {
        if (!isFocused && !hasInputValue && !isDraggingRef.current)
          setPanelExpanded(false);
      }}
    >
      {/* HEADER */}
      <div className="drag-handle" onPointerDown={onPointerDown}>
        <strong>Route Planner</strong>
      </div>

      {/* COLLAPSED VIEW */}
      {!panelExpanded && (
        <div className="collapsed-content">Hover to expand</div>
      )}

      {/* EXPANDED VIEW */}
      {panelExpanded && (
        <div className="panel-content">
          {/* START */}
          <div className="route-input-item">
            <PlaceAutocompleteInput
              placeholder="Choose starting point"
              onFocus={() => {
                setIsFocused(true);
                setPanelExpanded(true);
              }}
              onBlur={() => setIsFocused(false)}
              onValueChange={(value) => setHasInputValue(value.trim() !== "")}
              onPlaceSelect={(place) => {
                console.log(place);

                const value = place.formattedAddress || place.displayName || "";

                setOrigin(value);

                setHasInputValue(value.trim() !== "");

                debounceCalculateRoute();
              }}
            />
          </div>

          {/* USE CURRENT LOCATION */}
          <button
            type="button"
            className="full-btn"
            onClick={setCurrentLocationAsStart}
          >
            📍 Use My Location as Start
          </button>

          {/* STOPS */}
          {stopValues.map((value, index) => (
            <div key={index} className="route-input-item">
              <PlaceAutocompleteInput
                placeholder={`Add stop ${index + 1}`}
                onFocus={() => {
                  setIsFocused(true);
                  setPanelExpanded(true);
                }}
                onBlur={() => setIsFocused(false)}
                onValueChange={(value) => setHasInputValue(value.trim() !== "")}
                onPlaceSelect={(place) => {
                  console.log(place);

                  const value =
                    place.formattedAddress || place.displayName || "";

                  setStopValues((prev) => {
                    const updated = [...prev];
                    updated[index] = value;
                    return updated;
                  });

                  setHasInputValue(value.trim() !== "");

                  debounceCalculateRoute();
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
              onFocus={() => {
                setIsFocused(true);
                setPanelExpanded(true);
              }}
              onBlur={() => setIsFocused(false)}
              onValueChange={(value) => setHasInputValue(value.trim() !== "")}
              onPlaceSelect={(place) => {
                console.log(place);

                const value = place.formattedAddress || place.displayName || "";

                setDestination(value);

                setHasInputValue(value.trim() !== "");

                debounceCalculateRoute();
              }}
            />
          </div>

          {/* SEARCH BUTTON */}
          <button type="button" className="search-btn" onClick={calculateRoute}>
            🔍 Search Route
          </button>

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
      )}
    </div>
  );
}
