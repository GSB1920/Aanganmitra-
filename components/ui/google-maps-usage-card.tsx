"use client";

import { MapPin, ExternalLink, AlertCircle, Info } from "lucide-react";
import Link from "next/link";

export default function GoogleMapsUsageCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mt-6">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <MapPin className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Map Service Status</h3>
        </div>
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900">Monthly Free Credit</h4>
              <p className="text-sm text-blue-700 mt-1">
                Google provides <strong>$200 USD</strong> of free usage every month. This is approximately <strong>28,000 map loads</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Estimated Monthly Usage</span>
            <span className="text-gray-900 font-medium">Unknown (Check Console)</span>
          </div>
          {/* Visual representation of the "Free Tier" bucket */}
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gray-300 w-full" /> 
          </div>
          <p className="text-xs text-gray-500">
            We cannot track exact usage here. Please check the Google Cloud Console for real-time billing and quotas.
          </p>
        </div>

        <div className="pt-2">
          <Link 
            href="https://console.cloud.google.com/google/maps-hosted/dashboard" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Check Real-time Usage
            <ExternalLink className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
