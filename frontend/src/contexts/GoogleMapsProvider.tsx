// src/providers/GoogleMapsProvider.tsx
import { createContext, useContext, type ReactNode } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

// ENABLED APIs
// Places API (for autocomplete).
// Places API (New)
// Maps JavaScript API (for maps).
// Geocoding API (if needed for reverse lookups).


const GoogleMapsContext = createContext<{ isLoaded: boolean } | null>(null);

interface Props {
  children: ReactNode;
}


export const useGoogleMaps = () => {
  const ctx = useContext(GoogleMapsContext);
  if (!ctx) throw new Error("useGoogleMaps must be used within GoogleMapsProvider");
  return ctx;
};





export const GoogleMapsProvider = ({ children }: Props) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
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




// const GoogleMapsProvider = ({ children }: Props) => {
//   const { isLoaded, loadError } = useJsApiLoader({
//     googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
//     // Remove libraries array — we'll import dynamically
//     preventGoogleFontsLoading: true,
//   });

//   if (loadError) return <div>Error loading Google Maps</div>;
//   if (!isLoaded) return <div>Loading Maps...</div>;

//   return <>{children}</>;
// };






// import { LoadScript, useJsApiLoader } from "@react-google-maps/api";

// // const myLibraries: ("places")[] = ["places"];
// const myLibraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

// type Props = {
//   children: React.ReactNode;
// };



// const GoogleMapsProvider = ({ children }: Props) => {
//   const { isLoaded, loadError } = useJsApiLoader({
//     googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
//     libraries: myLibraries,
//     preventGoogleFontsLoading: true,
//   });

//   if (loadError) return <div>Error loading Google Maps</div>;
//   if (!isLoaded) return <div>Loading Maps...</div>;

//   return <>{children}</>;

// };

// export default GoogleMapsProvider;
