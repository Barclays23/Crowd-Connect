// src/types/google-maps.d.ts

declare namespace google.maps.places {
  interface PlaceAutocompleteElementOptions {
    includedRegionCodes?: string[];
    includedPrimaryTypes?: string[];
    placeholder?: string;
    // Add more options later if needed (locationBias, etc.)
  }

  class PlaceAutocompleteElement extends HTMLElement {
    constructor(options?: PlaceAutocompleteElementOptions);

    addEventListener(
      type: "gmp-select",
      listener: (this: PlaceAutocompleteElement, ev: PlaceAutocompleteSelectEvent) => void,
      options?: boolean | AddEventListenerOptions
    ): void;
  }

  interface PlaceAutocompleteSelectEvent extends Event {
    placePrediction: PlacePrediction | null;
  }

  interface PlacePrediction {
    toPlace(): Place;
  }

  interface Place {
    fetchFields(options: { fields: string[] }): Promise<void>;
    formattedAddress?: string;
    displayName?: { text: string };
    location?: {
      lat(): number;
      lng(): number;
    };
  }
}