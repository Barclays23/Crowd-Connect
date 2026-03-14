// src/components/common/GooglePlacesAutoComplete.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Uses 
// useMapsLibrary('places') from @vis.gl/react-google-maps and 
// manually fetches suggestions + renders a custom <ul> dropdown.

// Pros:
// Full control over styling — matches your design system perfectly
// You can customize every pixel of the dropdown

// Cons:
// More code to maintain
// You're responsible for UX edge cases (keyboard nav, blur timing, etc.)
// sessionToken is recreated on every render (bug in your current code — it should be in a useRef or useMemo)

export interface SelectedLocation {
  name: string;
  lat: number;
  lng: number;
  formattedAddress?: string;
}


interface PlacesAutocompleteProps {
   onPlaceSelected: (place: SelectedLocation) => void;
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

   const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
   const requestIdRef = useRef(0);


   useEffect(() => {
      if (placesLibrary && !sessionTokenRef.current) {
         sessionTokenRef.current = new placesLibrary.AutocompleteSessionToken();
      }
   }, [placesLibrary]);


   const fetchSuggestions = async (input: string) => {
      if (justSelected) return;

      if (!placesLibrary || input.length < 3) {
         setSuggestions([]);
         return;
      }

      const requestId = ++requestIdRef.current;
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
            sessionToken: sessionTokenRef.current ?? undefined,
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
            // circle: { center: { lat: 9.98, lng: 76.27 }, radius: 150000 },
            // },
            // includedPrimaryTypes: ["establishment", "geocode", "locality"],
         };

         const { suggestions } = await placesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
         if (requestId !== requestIdRef.current) return;
         setSuggestions(suggestions || []);

      } catch (err: unknown) {
         console.error("Autocomplete error:", err);
         setSuggestions([]);
         
      } finally {
         if (requestId === requestIdRef.current) {
            setLoading(false);
         }
      }
   };

   useEffect(() => {
      const timer = setTimeout(() => {
         const trimmed = inputValue.trim();

         if (trimmed.length < 3) {
            setSuggestions([]);
            return;
         }
         if (!justSelected) {
            fetchSuggestions(trimmed);
         }
      }, 300);

      return () => clearTimeout(timer);

   }, [inputValue, placesLibrary]);




   const handleSelect = async (
      suggestion: google.maps.places.AutocompleteSuggestion
   ) => {
      if (!suggestion?.placePrediction) {
         return;
      }

      
      try {
         
         const placePromise = suggestion.placePrediction.toPlace();
         console.log('placePromise :', placePromise)

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
            formattedAddress: place.formattedAddress ?? undefined,
         });

         setInputValue(name);
         setSuggestions([]);
         setJustSelected(true);

         inputRef.current?.blur();

         setTimeout(() => setJustSelected(false), 500);

         if (placesLibrary) {
            sessionTokenRef.current = new placesLibrary.AutocompleteSessionToken();
         }
         inputRef.current?.focus();

      } catch (err: unknown) {
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
         <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="w-full pl-9"
            autoComplete="on"
         />

         {loading && (
            // loading spinner
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
               <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
         )}

         {justSelected && !loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
               <CheckCircle2 className="w-5 h-5" />
            </div>
         )}

         {suggestions.length > 0 && (
            <ul 
               role="listbox"
               className="absolute z-50 w-full mt-1 bg-gray-900 border rounded-md shadow-lg max-h-60 overflow-auto">
               {suggestions.map((sug, idx) => (
                  <li
                     key={sug.placePrediction?.placeId ?? idx}
                     role="option"
                     className="px-3 py-2 hover:bg-gray-800 cursor-pointer text-sm text-white"
                     onMouseDown={(e) => e.preventDefault()}
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