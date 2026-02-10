// src/utils/google-place-autocomplete-widget.ts
import { toast } from "react-toastify";

/**
 * Sets up Google's new PlaceAutocompleteElement widget inside a container.
 * 
 * @param containerRef - React ref to the HTML div where the widget should render
 * @param onPlaceSelected - Callback when user selects a place
 * @param options - Optional customization (region, types, placeholder, etc.)
*/

// * types are used from src/types/google-maps.d.ts


export function setupGooglePlaceAutocompleteWidget(
  containerRef: React.RefObject<HTMLDivElement>,
  onPlaceSelected: (data: {
    name: string;
    lat: number;
    lng: number;
    formattedAddress?: string;
    placeId?: string;
  }) => void,
  options: {
    placeholder?: string;
    includedRegionCodes?: string[];
    includedPrimaryTypes?: string[];
    locationBias?: google.maps.Circle;
  } = {}
) {
    
    (async () => {
        if (!containerRef.current) {
            console.warn("Container not ready yet — skipping widget init");
            return;
        }
      
        try {
            // Load Places library if not already loaded
            await google.maps.importLibrary("places");

            const autocompleteElement = new google.maps.places.PlaceAutocompleteElement({
                includedRegionCodes: options.includedRegionCodes ?? ["in"],
                // Comment out or customize types based on needs
                // includedPrimaryTypes: options.includedPrimaryTypes ?? ["geocode"],
                // includedPrimaryTypes: ["geocode", "(cities)"],
                // includedPrimaryTypes: ["(cities)"],
                // includedPrimaryTypes: ["geocode"],
                placeholder: options.placeholder ?? "Search for a city or venue...",
                locationBias: options.locationBias,
            });

            const container = containerRef.current;
            if (!container) {
                console.warn("Container ref is null — cannot attach widget");
                return;
            }
            container.innerHTML = "";
            container.appendChild(autocompleteElement);

            autocompleteElement.addEventListener("gmp-select", async (e) => {
                const prediction = (e as any).placePrediction;

                if (!prediction) {
                console.warn("No placePrediction in gmp-select event", e);
                return;
                }

                const place = prediction.toPlace();

                try {
                await place.fetchFields({
                    fields: ["formattedAddress", "displayName", "location"],
                });

                // Prefer displayName.text → fallback to formattedAddress parts
                let name =
                    place.displayName ||
                    place.formattedAddress?.split(',')[0].trim() ||
                    // place.formattedAddress?.split(",").slice(0, 2).map(s => s.trim()).join(", ") ||
                    place.formattedAddress ||
                    "Selected location";

                const lat = place.location?.lat() ?? 0;
                const lng = place.location?.lng() ?? 0;

                console.log("Selected place:", { name, lat, lng });

                if (lat !== 0 && lng !== 0) {
                    onPlaceSelected({
                    name,
                    lat,
                    lng,
                    formattedAddress: place.formattedAddress,
                    placeId: place.id || place.placeId,
                    });
                }
                } catch (fetchErr) {
                console.error("fetchFields failed:", fetchErr);
                toast.error("Failed to load place details");
                }
            });
        } catch (error) {
            console.error("Failed to initialize PlaceAutocompleteElement:", error);
            toast.error("Location search failed to load. Try again later.");
        }
    })();
}