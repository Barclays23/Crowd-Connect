// src/components/common/GooglePlacesAutoComplete.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useMapsLibrary, APIProvider, Map } from '@vis.gl/react-google-maps';
import { CheckCircle2 } from 'lucide-react';



interface PlacesAutocompleteProps {
   onPlaceSelected: (place: {
      name: string;
      lat: number;
      lng: number;
      formattedAddress?: string;
   }) => void;
   placeholder?: string;
   defaultValue?: string;
   className?: string;
}



export const GooglePlacesAutoComplete: React.FC<PlacesAutocompleteProps> = ({
   onPlaceSelected,
   placeholder = "Search for a city, venue or address...",
   defaultValue = "",
   className = "",
}) => {
   const placesLibrary = useMapsLibrary('places');

   const inputRef = useRef<HTMLInputElement>(null);
   const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
   const [inputValue, setInputValue] = useState(defaultValue);
   const [loading, setLoading] = useState(false);
   const [justSelected, setJustSelected] = useState(false);

   const sessionToken = placesLibrary ? new placesLibrary.AutocompleteSessionToken() : undefined;

   const fetchSuggestions = async (input: string) => {
      if (!placesLibrary || input.length < 3) {
         setSuggestions([]);
         return;
      }

      setLoading(true);

      try {
         const keralaBiasBounds: google.maps.LatLngBoundsLiteral = {
            south: 8.0,   // approx southern tip
            west: 74.0,   // approx western coast
            north: 12.8,  // approx northern border
            east: 77.5    // approx eastern side
         };

         const request: google.maps.places.AutocompleteRequest = {
         input,
         sessionToken,
         // locationBias: keralaBiasBounds,
         // Optional: bias toward Kerala / India
         // locationBias: {
         //    center: {
         //       latitude: 9.98,   // Kanayannur / Thrissur approx
         //       longitude: 76.27
         //    },
         //    radius: 200000,       // 200 km in meters – adjust as needed (max ~50000 for strict restriction, but bias allows larger)
         // },
         // Or circle bias around Kanayannur
         // locationBias: {
         //   circle: { center: { lat: 9.98, lng: 76.27 }, radius: 150000 },
         // },
         // includedPrimaryTypes: ["establishment", "geocode", "locality"],
         };

         const { suggestions } = await placesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
         setSuggestions(suggestions || []);

      } catch (err) {
         console.error("Autocomplete error:", err);
         setSuggestions([]);
         
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      const timer = setTimeout(() => {
         if (inputValue && !justSelected) {
            fetchSuggestions(inputValue.trim());
         } else if (!inputValue) {
            setSuggestions([]);
         }
      }, 300);

      return () => clearTimeout(timer);

   }, [inputValue, placesLibrary, justSelected]);




   const handleSelect = async (suggestion: any) => {  // temporarily use any to avoid type blocks
      if (!suggestion?.placePrediction) {
         return;
      }

      try {

         const placePromise = suggestion.placePrediction.toPlace();

         const fetched = await placePromise.fetchFields({
            fields: ['displayName', 'location', 'formattedAddress'],
         });

         const place = fetched?.place;

         if (!place) {
            return;
         }

         if (!place.location) {
            return;
         }

         const lat = place.location.lat?.();
         const lng = place.location.lng?.();

         if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
            return;
         }

         const name =
            place.displayName ||
            suggestion.placePrediction?.text?.text ||
            inputValue ||
            "Selected location";

         console.log("Selected location:", { name, lat, lng });

         onPlaceSelected({
            name,
            lat,
            lng,
            formattedAddress: place.formattedAddress,
         });

         setInputValue(name);
         setJustSelected(true);
         setTimeout(() => setJustSelected(false), 500);
         setSuggestions([]);           // close list
         inputRef.current?.focus();
      } catch (err) {
         console.error("ERROR during location selection:", err);
      }
   };



   const handleBlur = () => {
      setTimeout(() => {
         setSuggestions([]);
      }, 200); // small delay so click on item registers first
   };




   return (
      <div className={`relative ${className}`}>
         <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="w-full h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
         />

         {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
               <span className="text-gray-500 animate-pulse">...</span>
            </div>
         )}

         {inputValue && suggestions.length === 0 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
               <CheckCircle2 className="w-5 h-5" />
            </div>
         )}

         {suggestions.length > 0 && (
            <ul className="absolute z-50 w-full mt-1 bg-gray-900 border rounded-md shadow-lg max-h-60 overflow-auto">
               {suggestions.map((sug: any, idx: number) => (
                  <li
                  key={idx}
                  className="px-3 py-2 hover:bg-gray-800 cursor-pointer text-sm text-white"
                  onMouseDown={(e) => e.preventDefault()}  // ← prevents input blur before click
                  onClick={() => {
                     handleSelect(sug);
                  }}
                  >
                  {sug.placePrediction?.text?.text || 'Unknown Place'}
                  </li>
               ))}
            </ul>
         )}
      </div>
   );
};