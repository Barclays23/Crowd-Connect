// frontent/src/utils/google-legacy-autocomplete.ts

import { toast } from "react-toastify";


// Old Places API auto complete method (legacy)
// Deprecated for new projects (warnings in console, won't work for new API keys post-March 2025).
// Billing risk without proper session management


export function setupGooglePlacesAutocomplete1(
   input: HTMLInputElement,
   onSelect: (place: {
      name: string;
      lat: number;
      lng: number;
   }) => void
) {

   if (!window.google?.maps?.places) {
      console.error("Google Maps not loaded");
      toast.warn("Google Maps not loaded");
      return;
   }

   // 1️⃣ Create session token
   let autoCompleteSessionToken = new google.maps.places.AutocompleteSessionToken();

   // 2️⃣ Create  autocomplete
   const autocomplete = new google.maps.places.Autocomplete(
      input, 
      {
         // fields: ["formatted_address", "geometry", "place_id"],
         // fields: ["name", "geometry"],
         fields: ["formatted_address", "geometry"],
         autoCompleteSessionToken
      } as google.maps.places.AutocompleteOptions
   );


   // 3️⃣ Listen for place selection
   autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if (!place.geometry || !place.geometry.location) return;

      onSelect({
         name: place.formatted_address ?? "",
         lat: place.geometry.location.lat(),
         lng: place.geometry.location.lng(),
      });

      // 4️⃣ Reset session token AFTER selection
      autoCompleteSessionToken = new google.maps.places.AutocompleteSessionToken();
      autocomplete.setOptions(
         { autoCompleteSessionToken } as google.maps.places.AutocompleteOptions
      );
   });

   return autocomplete;
}
