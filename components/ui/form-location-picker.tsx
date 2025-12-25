"use client";

import { useState, useRef } from "react";
import LocationPicker from "./location-picker";

export default function FormLocationPicker({ initialLat, initialLng }: { initialLat?: number | null, initialLng?: number | null }) {
  const [coords, setCoords] = useState({ lat: initialLat || null, lng: initialLng || null });
  const [addressUpdate, setAddressUpdate] = useState<{ full: string; city: string; area: string } | null>(null);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Pin Location</label>
        <input type="hidden" name="latitude" value={coords.lat || ""} />
        <input type="hidden" name="longitude" value={coords.lng || ""} />
        <LocationPicker
          latitude={coords.lat}
          longitude={coords.lng}
          onChange={(lat, lng) => setCoords({ lat, lng })}
          onAddressSelect={(addr) => setAddressUpdate(addr)}
        />
        <p className="text-xs text-gray-500">
          Click on the map to update the location.
        </p>
      </div>

      {addressUpdate && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800 animate-in fade-in slide-in-from-top-2">
          <p className="font-medium mb-1">Update address details?</p>
          <p className="mb-2 text-blue-600/80 text-xs">Based on the new pin location, we found:</p>
          <div className="grid gap-1 mb-3 text-xs">
            <div className="flex gap-2"><span className="font-semibold w-12">City:</span> {addressUpdate.city}</div>
            <div className="flex gap-2"><span className="font-semibold w-12">Area:</span> {addressUpdate.area}</div>
            <div className="flex gap-2"><span className="font-semibold w-12">Addr:</span> {addressUpdate.full}</div>
          </div>
          <button
            type="button"
            onClick={() => {
              // We need to find the inputs and update them. 
              // Since this component is inside a form, we can use document.getElementsByName or refs if passed.
              // For simplicity in this server component wrapper, we will emit an event or just let the user copy.
              // ACTUALLY, the best way is to render hidden inputs or controlled inputs if we were in the main page.
              // BUT, this is a separate component.
              
              // Let's use direct DOM manipulation for the inputs in the parent form which is standard in HTML forms
              const cityInput = document.querySelector('input[name="city"]') as HTMLInputElement;
              const areaInput = document.querySelector('input[name="area"]') as HTMLInputElement; // Check if name is 'area' or 'area_sqft' - it's 'area' in add page but wait.
              const addressInput = document.querySelector('textarea[name="address"]') as HTMLTextAreaElement;

              if (cityInput && addressUpdate.city) cityInput.value = addressUpdate.city;
              if (areaInput && addressUpdate.area) areaInput.value = addressUpdate.area;
              if (addressInput && addressUpdate.full) addressInput.value = addressUpdate.full;
              
              setAddressUpdate(null);
            }}
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
          >
            Apply to Form
          </button>
        </div>
      )}
    </div>
  );
}
