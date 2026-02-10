// src/components/common/GooglePlacesWidgetAutoComplete.tsx
import React, { useEffect, useRef } from 'react';
import { setupGooglePlaceAutocompleteWidget } from '@/utils/google-place-autocomplete-widget';
import { MapPin, CheckCircle2 } from 'lucide-react';
import { useGoogleMaps2 } from '@/contexts/GoogleMapsProvider2'; // or whichever provider you're using



interface GooglePlacesWidgetAutoCompleteProps {
  onPlaceSelected: (data: {
    name: string;
    lat: number;
    lng: number;
    formattedAddress?: string;
    placeId?: string;
  }) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string; // optional – can be used to pre-fill if needed
}




export const GooglePlacesWidgetAutoComplete: React.FC<GooglePlacesWidgetAutoCompleteProps> = ({
  onPlaceSelected,
  placeholder = "Search for a city or venue...",
  className = "",
  defaultValue = "",
}) => {
  const { isLoaded } = useGoogleMaps2(); // or useGoogleMaps1 — whichever loads the script
  const autocompleteWidgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoaded || !autocompleteWidgetRef.current) return;

    setupGooglePlaceAutocompleteWidget(
      autocompleteWidgetRef as React.RefObject<HTMLDivElement>,
      onPlaceSelected,
      {
        placeholder,
        // Add any other options you want
        includedRegionCodes: ['in'],
        // locationBias: { ... } if needed later
        // Optional: add bias toward Kerala if needed
        // locationBias: {
        //   circle: {
        //     center: { lat: 10.0, lng: 76.3 },
        //     radius: 200000,
        //   },
        // },
      }
    );

    return () => {
      if (autocompleteWidgetRef.current) {
        autocompleteWidgetRef.current.innerHTML = '';
      }
    };
  }, [isLoaded, onPlaceSelected, placeholder]);




  return (
    <div className={`relative ${className}`}>
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-tertiary) z-10 pointer-events-none" />
      
      <div
        ref={autocompleteWidgetRef}
        className="w-full h-10 border rounded-md focus-within:ring-2 focus-within:ring-(--brand-primary)"
      />

      {/* Optional: show checkmark when location is selected */}
      {/* You can pass selectedCords from parent or manage state here if needed */}
    </div>
  );
};