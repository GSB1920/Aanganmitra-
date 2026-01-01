import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { Loader2, MapPin } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const libraries: ("places")[] = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "0.5rem",
};

// Default center (India)
const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629,
};

interface MapFieldProps {
  value: { lat: number; lng: number } | null;
  onChange: (value: { lat: number; lng: number }) => void;
  disabled?: boolean;
}

export default function MapField({ value, onChange, disabled }: MapFieldProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(value);

  useEffect(() => {
    if (value) {
      setMarker(value);
    }
  }, [value]);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (disabled) return;
    if (e.latLng) {
      const newPos = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setMarker(newPos);
      onChange(newPos);
    }
  }, [disabled, onChange]);

  if (loadError) {
    return (
      <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-600 text-sm">
        Error loading Google Maps. Please check API Key configuration.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[300px] border border-gray-200 rounded-md bg-gray-50">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading Map...</span>
      </div>
    );
  }

  // Fallback if no API Key provided (optional check)
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      return (
         <div className="space-y-3">
             <div className="p-4 border border-yellow-200 rounded-md bg-yellow-50 text-yellow-700 text-sm">
                 <p className="font-semibold">Google Maps API Key Missing</p>
                 <p>Please configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env file.</p>
             </div>
             {/* Manual Entry Fallback */}
             <div className="grid grid-cols-2 gap-4">
                 <div>
                     <label className="text-xs text-gray-500">Latitude</label>
                     <input 
                        type="number" 
                        value={value?.lat || ''} 
                        onChange={e => onChange({ lat: parseFloat(e.target.value), lng: value?.lng || 0 })}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        disabled={disabled}
                     />
                 </div>
                 <div>
                     <label className="text-xs text-gray-500">Longitude</label>
                     <input 
                        type="number" 
                        value={value?.lng || ''} 
                        onChange={e => onChange({ lat: value?.lat || 0, lng: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        disabled={disabled}
                     />
                 </div>
             </div>
         </div>
      )
  }

  return (
    <div className="space-y-3">
      <div className="border border-gray-300 rounded-lg overflow-hidden relative">
         <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={marker ? 15 : 5}
            center={marker || defaultCenter}
            onClick={onMapClick}
            options={{
               disableDefaultUI: false,
               zoomControl: true,
               streetViewControl: false,
               mapTypeControl: false,
            }}
         >
            {marker && <Marker position={marker} />}
         </GoogleMap>
         {!disabled && (
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-3 py-1 rounded-md shadow-sm text-xs font-medium text-gray-600">
               Click on map to set location
            </div>
         )}
      </div>
      
      <div className="flex items-center gap-4 text-xs text-gray-500">
         <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>Lat: {marker?.lat.toFixed(6) || 'Not set'}</span>
         </div>
         <div>
            <span>Lng: {marker?.lng.toFixed(6) || 'Not set'}</span>
         </div>
      </div>
    </div>
  );
}
