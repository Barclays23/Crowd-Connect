// frontend/src/utils/google-map-utils/google-place-new-autocomplete.ts
// new method for google places New API for autocomplete
// GooglePlacesAutoComplete component already does internally
import { toast } from "react-toastify";

// Maintain a singleton session token to group autocomplete billing requests
let sessionToken: google.maps.places.AutocompleteSessionToken | null = null;

export interface PlaceDetails {
   name: string;
   lat: number;
   lng: number;
}

export async function fetchPlaceSuggestions(
   inputValue: string,
) {
   const trimmedInput = inputValue?.trim();
   if (!trimmedInput || trimmedInput.length < 3) return [];

   try {
      const placesLib = (await google.maps.importLibrary(
         "places"
      )) as typeof google.maps.places;

      // Initialize session token if it doesn't exist to optimize API billing
      if (!sessionToken) {
         sessionToken = new placesLib.AutocompleteSessionToken();
      }

      const request = {
         input: trimmedInput,
         includedRegionCodes: ["in"],
         includedPrimaryTypes: ["geocode", "(cities)"],
         sessionToken,
      };

      const { suggestions } = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
      
      // Return suggestions for your dropdown
      return suggestions || [];

   } catch (err: unknown) {
      console.error("Places API Suggestion Error:", err);
      toast.warn("Failed to fetch location suggestions");
      return [];
   }
}

export async function getPlaceDetailsFromSuggestion(
   suggestion: google.maps.places.AutocompleteSuggestion
): Promise<PlaceDetails> {
   try {
      if (!suggestion.placePrediction) {
         throw new Error("No place prediction available for this suggestion.");
      }

      const place = suggestion.placePrediction.toPlace();

      await place.fetchFields({
         fields: ["formattedAddress", "location"],
      });

      // Clear the session token after a terminal selection is made
      sessionToken = null;

      return {
         name: place.formattedAddress || "",
         lat: place.location?.lat() ?? 0,
         lng: place.location?.lng() ?? 0,
      };
      
   } catch (err: unknown) {
      console.error("Error fetching place details:", err);
      toast.warn("Failed to retrieve place details");
      return { name: "", lat: 0, lng: 0 };
   }
}