
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse" />
          <div className="space-y-2">
            <div className="w-64 h-8 bg-gray-100 rounded animate-pulse" />
            <div className="w-48 h-4 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-24 h-10 bg-gray-100 rounded animate-pulse" />
          <div className="w-24 h-10 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-2 space-y-6">
          <div className="w-full aspect-video bg-gray-100 rounded-xl animate-pulse" />
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="w-48 h-6 bg-gray-100 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i}>
                    <div className="w-24 h-4 bg-gray-100 rounded mb-2 animate-pulse" />
                    <div className="w-32 h-5 bg-gray-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i}>
                    <div className="w-24 h-4 bg-gray-100 rounded mb-2 animate-pulse" />
                    <div className="w-32 h-5 bg-gray-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
             <div className="w-24 h-4 bg-gray-100 rounded animate-pulse" />
             <div className="w-48 h-8 bg-gray-100 rounded animate-pulse" />
             <div className="pt-3 border-t border-gray-100 flex justify-between">
                <div className="w-20 h-4 bg-gray-100 rounded animate-pulse" />
                <div className="w-24 h-4 bg-gray-100 rounded animate-pulse" />
             </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
             <div className="w-32 h-5 bg-gray-100 rounded animate-pulse" />
             <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
                    <div className="space-y-1">
                      <div className="w-16 h-3 bg-gray-100 rounded animate-pulse" />
                      <div className="w-32 h-4 bg-gray-100 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
