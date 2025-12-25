"use client";

import { useState, useEffect, useCallback, memo, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { MapPin, Loader2, AlertCircle, Locate } from "lucide-react";

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "0.75rem",
};

const defaultCenter = {
  lat: 19.0760, // Mumbai default
  lng: 72.8777,
};

interface LocationPickerProps {
  latitude?: number | null;
  longitude?: number | null;
  onChange?: (lat: number, lng: number) => void;
  onAddressSelect?: (address: { full: string; city: string; area: string }) => void;
  readOnly?: boolean;
}

function LocationPicker({ latitude, longitude, onChange, onAddressSelect, readOnly = false }: LocationPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    // libraries: ["places"], // Removed to optimize bundle and API usage
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [center, setCenter] = useState(defaultCenter);
  const [isLocating, setIsLocating] = useState(false);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    if (latitude && longitude) {
      const pos = { lat: latitude, lng: longitude };
      setMarker(pos);
      setCenter(pos);
    }
  }, [latitude, longitude]);

  // Auto-locate on first load if no coordinates provided
  useEffect(() => {
    if (!latitude && !longitude && !readOnly) {
      handleLocateMe();
    }
  }, []); // Run once on mount

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    geocoderRef.current = new google.maps.Geocoder();
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
    geocoderRef.current = null;
  }, []);

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCenter(pos);
        if (map) {
          map.panTo(pos);
          map.setZoom(18); // Zoom in close for buildings
        }
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        // Silently fail or show toast - for now just stop loading
      }
    );
  };

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (readOnly) return;
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarker({ lat, lng });
      if (onChange) onChange(lat, lng);

      // Reverse Geocoding
      if (onAddressSelect && geocoderRef.current) {
        geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            const result = results[0];
            const components = result.address_components;

            let city = "";
            let area = "";

            for (const component of components) {
              if (component.types.includes("locality")) {
                city = component.long_name;
              }
              if (component.types.includes("sublocality") || component.types.includes("sublocality_level_1")) {
                area = component.long_name;
              }
            }

            onAddressSelect({
              full: result.formatted_address,
              city,
              area
            });
          }
        });
      }
    }
  }, [onChange, onAddressSelect, readOnly]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-6 text-center">
        <MapPin className="w-10 h-10 text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900">Map Unavailable</h3>
        <p className="text-gray-500 max-w-sm">
          Please add <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your environment variables to enable the map.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full h-[400px] bg-red-50 rounded-xl border border-red-200 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
        <h3 className="text-lg font-medium text-red-900">Map Error</h3>
        <p className="text-red-600 max-w-sm">
          Failed to load Google Maps. Please check your API key and billing status.
        </p>
        <p className="text-xs text-red-500 mt-2 font-mono bg-red-100 px-2 py-1 rounded">
          {loadError.message}
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[400px] bg-gray-50 rounded-xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm text-gray-500">Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={onMapClick}
        options={{
          disableDefaultUI: readOnly,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: !readOnly,
          zoomControl: !readOnly,
        }}
      >
        {marker && <Marker position={marker} />}
      </GoogleMap>
      
      {!readOnly && (
        <button
          type="button"
          onClick={handleLocateMe}
          className="absolute top-4 right-4 bg-white p-2.5 rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200 z-10 group"
          title="Use My Current Location"
        >
          {isLocating ? (
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          ) : (
            <Locate className="w-5 h-5 text-gray-700 group-hover:text-blue-600" />
          )}
        </button>
      )}
    </div>
  );
}

export default memo(LocationPicker);
