// src/contexts/GoogleMapsProvider2.tsx
import React, { createContext, useContext, type ReactNode } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';




interface Props {
    children: ReactNode;
}

const GoogleMapsContext = createContext<{ isLoaded: boolean } | null>(null);


export const useGoogleMaps2 = () => {
  const ctx = useContext(GoogleMapsContext);
  if (!ctx) throw new Error("useGoogleMaps must be used within GoogleMapsProvider");
  return ctx;
};



export const GoogleMapsProvider2 = ({ children }: Props) => {
  // We don't need manual isLoaded check anymore – APIProvider handles loading
  // But to keep your existing context API, we can simulate it
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Optional: You can listen for load if needed
  React.useEffect(() => {
    // Simple way: assume loaded after mount (APIProvider manages it)
    setIsLoaded(true);
  }, []);

  return (
    <APIProvider
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}
      libraries={['places']}          // ← Critical: loads Places (New)
      region="IN"                     // Bias to India / Kerala
      language="en"
      onLoad={() => console.log('Google Maps APIProvider loaded successfully')}
    >
      <GoogleMapsContext.Provider value={{ isLoaded }}>
        {children}
      </GoogleMapsContext.Provider>
    </APIProvider>
  );
};