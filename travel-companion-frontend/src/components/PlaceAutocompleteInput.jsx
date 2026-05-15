import { useEffect, useRef } from "react";

export default function PlaceAutocompleteInput({ onPlaceSelect, placeholder }) {
  const containerRef = useRef(null);

  useEffect(() => {
    let autocomplete;
    let isMounted = true;

    const init = async () => {
      if (!window.google || !containerRef.current) return;

      // REQUIRED for PlaceAutocompleteElement
      await window.google.maps.importLibrary("places");

      if (!isMounted || !containerRef.current) return;

      autocomplete = new window.google.maps.places.PlaceAutocompleteElement();

      autocomplete.placeholder = placeholder;

      autocomplete.addEventListener(
        "gmp-placeselect",
        async ({ placePrediction }) => {
          const place = placePrediction.toPlace();

          await place.fetchFields({
            fields: ["displayName", "formattedAddress", "location"],
          });

          onPlaceSelect(place);
        },
      );

      containerRef.current.appendChild(autocomplete);
    };

    init();

    // CLEANUP
    return () => {
      isMounted = false;

      if (autocomplete) autocomplete.remove();
    };
  }, [placeholder, onPlaceSelect]);

  return <div ref={containerRef} />;
}
