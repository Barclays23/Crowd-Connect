// frontend/src/hooks/useReverseGeocode.ts
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { useCallback } from 'react';

export const useReverseGeocode = () => {
   const geocodingLib = useMapsLibrary('geocoding');

   const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
      const fallback = `${lat.toFixed(2)}, ${lng.toFixed(2)}`;

      // If the library hasn't loaded yet, return the coordinates
      if (!geocodingLib) return fallback;

      const geocoder = new geocodingLib.Geocoder();

      try {
         const response = await geocoder.geocode({ location: { lat, lng } });

         if (response.results && response.results.length > 0) {
         const components = response.results[0].address_components;
         const city =
            components.find((c) => c.types.includes("locality"))?.long_name ||
            components.find((c) => c.types.includes("administrative_area_level_2"))?.long_name ||
            components.find((c) => c.types.includes("administrative_area_level_1"))?.long_name;

         return city ?? response.results[0].formatted_address;
         }

         return fallback;
      } catch (err) {
         console.error('Reverse geocode failed:', err);
         return fallback;
      }
   }, [geocodingLib]);

   return { reverseGeocode, isGeocodingLoaded: !!geocodingLib };
};