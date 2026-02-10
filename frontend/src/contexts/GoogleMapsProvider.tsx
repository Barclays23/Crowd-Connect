// src/contexts/GoogleMapsProvider.tsx
import { createContext, useContext, type ReactNode } from 'react';
import { LoadScript, useJsApiLoader } from "@react-google-maps/api";

// ENABLED APIs
// Places API (for autocomplete).
// Places API (New)
// Maps JavaScript API (for maps).
// Geocoding API (if needed for reverse lookups).


const GoogleMapsContext = createContext<{ isLoaded: boolean } | null>(null);

interface Props {
  children: ReactNode;
}


// // const myLibraries: ("places")[] = ["places"];
const myLibraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];


export const useGoogleMaps = () => {
  const ctx = useContext(GoogleMapsContext);
  if (!ctx) throw new Error("useGoogleMaps must be used within GoogleMapsProvider");
  return ctx;
};



export const GoogleMapsProvider = ({ children }: Props) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    libraries: myLibraries,
    // libraries: []  ← remove this! We load dynamically now
    preventGoogleFontsLoading: true,
  });


  if (loadError) return <div>Error loading Google Maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <GoogleMapsContext.Provider value={{ isLoaded }}>
      {children}
    </GoogleMapsContext.Provider>
  );

};
