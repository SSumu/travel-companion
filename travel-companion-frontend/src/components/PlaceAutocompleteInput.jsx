import { useEffect, useRef } from "react";

export default function PlaceAutocompleteInput({
  onPlaceSelect,
  placeholder,
  onFocus,
  onBlur,
  onValueChange,
}) {
  const containerRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!window.google || !containerRef.current) return;

      // REQUIRED for PlaceAutocompleteElement | Load Places library
      await window.google.maps.importLibrary("places");

      if (!isMounted || !containerRef.current) return;

      // Create Element
      const autocomplete =
        new window.google.maps.places.PlaceAutocompleteElement();

      autocomplete.placeholder = placeholder;

      // ✅ Handle place selection
      const onPlaceSelectHandler = async ({ placePrediction }) => {
        const place = placePrediction.toPlace();

        await place.fetchFields({
          fields: ["displayName", "formattedAddress", "location"],
        });

        onPlaceSelect(place);
      };

      // KEEP PANEL EXPANDED WHILE TYPING | INPUT CHANGE
      const onInputHandler = (e) => {
        const value = e.target.value || "";

        // if (onValueChange) onValueChange(value);
        onValueChange?.(value);
      };

      // FOCUS
      // const handleFocus = () => {
      //   if (onFocus) onFocus();
      // };
      const handleFocus = () => onFocus?.();

      // BLUR
      // const handleBlur = () => {
      //   if (onBlur) onBlur();
      // };
      const handleBlur = () => onBlur?.();

      autocomplete.addEventListener("gmp-placeselect", onPlaceSelectHandler);

      // Bridge to parent panel
      // Detect Input
      autocomplete.addEventListener("input", onInputHandler);

      // Detect focus
      autocomplete.addEventListener("focus", handleFocus);

      // Detect blur
      autocomplete.addEventListener("blur", handleBlur);

      // Save refs for cleanup
      autocompleteRef.current = {
        el: autocomplete,
        onPlaceSelectHandler,
        onInputHandler,
        handleFocus,
        handleBlur,
      };

      containerRef.current.innerHTML = "";

      containerRef.current.appendChild(autocomplete);
    };

    init();

    // CLEANUP
    return () => {
      isMounted = false;

      const ref = autocompleteRef.current;

      if (ref?.el) {
        ref.el.removeEventListener("gmp-placeselect", ref.onPlaceSelectHandler);
        ref.el.removeEventListener("input", ref.onInputHandler);
        ref.el.removeEventListener("focus", ref.handleFocus);
        ref.el.removeEventListener("blur", ref.handleBlur);
        ref.el.remove();
      }

      autocompleteRef.current = null;
    };
  }, [placeholder, onPlaceSelect, onFocus, onBlur, onValueChange]);

  return <div ref={containerRef} />;
  // return (
  //   <input
  //     type="text"
  //     ref={containerRef}
  //     placeholder={placeholder}
  //     onFocus={onFocus}
  //     onBlur={onBlur}
  //   />
  // );
}
