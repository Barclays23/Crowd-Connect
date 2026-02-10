// frontend/src/utils/googlePlacesNew.ts
// new method for google places New API for autocomplete
import { toast } from "react-toastify";



let sessionToken: google.maps.places.AutocompleteSessionToken | null = null;


// pair two
export async function setupPlacesAutocompleteNew(
   inputValue: string,
   onSelect: (place: { name: string; lat: number; lng: number }) => void
   ) {
   if (!inputValue || inputValue.length < 3) return;

   try {
      const placesLib = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;

      // Session token (optional but recommended for billing grouping)
      if (!sessionToken) {
         sessionToken = new (placesLib.AutocompleteSessionToken || (placesLib as any).AutocompleteSessionToken)();
         // sessionToken = new google.maps.places.AutocompleteSessionToken();
      }


      const { AutocompleteSuggestion } = placesLib as typeof placesLib & {
         AutocompleteSuggestion: typeof google.maps.places.AutocompleteSuggestion;
      };

      const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
         input: inputValue,
         includedRegionCodes: ["in"],
         includedPrimaryTypes: ["geocode", "(cities)"],
         sessionToken,
      });

      // Return suggestions for your dropdown
      return suggestions || [];

   } catch (err) {
      console.error(err);
      toast.warn("Failed to fetch location suggestions");
      return [];
   }
}


// pair two
export async function getPlaceDetailsFromSuggestion(suggestion: any) {
   const place = suggestion.placePrediction.toPlace();

   await place.fetchFields({
      fields: ["formattedAddress", "location"],
   });

   return {
      name: place.formattedAddress || "",
      lat: place.location?.lat() ?? 0,
      lng: place.location?.lng() ?? 0,
   };
}



// pair one
export async function getPlacePredictions(input: string) {
   const placesLib = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;
   const { AutocompleteSuggestion } = placesLib as typeof placesLib & {
      AutocompleteSuggestion: typeof google.maps.places.AutocompleteSuggestion;
   };

   const request = {
      input,
      includedPrimaryTypes: ["geocode", "(cities)"],
      includedRegionCodes: ["in"],
   };
   const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
   return suggestions || [];
}


// pair one
export async function getPlaceDetailsFromPrediction(prediction: any) {
   const place = prediction.toPlace();
   await place.fetchFields({ fields: ["formattedAddress", "location"] });
   return {
      name: place.formattedAddress || "",
      lat: place.location?.lat() || 0,
      lng: place.location?.lng() || 0,
   };
}