
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:max-w-md h-10 bg-gray-100 rounded-lg animate-pulse" />
        <div className="flex gap-3 w-full md:w-auto">
          <div className="w-32 h-10 bg-gray-100 rounded-lg animate-pulse" />
          <div className="w-24 h-10 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden h-full">
            <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-6 bg-gray-100 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
              <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
                <div className="h-4 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
