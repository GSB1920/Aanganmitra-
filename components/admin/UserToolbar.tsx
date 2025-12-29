"use client";

import { Search, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useTransition } from "react";

export default function UserToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentTab = searchParams.get("role") || "all";
  const currentSearch = searchParams.get("q") || "";
  const currentLimit = searchParams.get("limit") || "10";

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    params.set("page", "0"); // Reset to first page
    
    startTransition(() => {
      router.replace(`?${params.toString()}`);
    });
  }, 300);

  const handleTabChange = (role: string) => {
    const params = new URLSearchParams(searchParams);
    if (role === "all") {
      params.delete("role");
    } else {
      params.set("role", role);
    }
    params.set("page", "0");
    
    startTransition(() => {
      router.replace(`?${params.toString()}`);
    });
  };

  const handleLimitChange = (limit: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("limit", limit);
    params.set("page", "0");
    
    startTransition(() => {
      router.replace(`?${params.toString()}`);
    });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-lg self-start relative">
          <button
            onClick={() => handleTabChange("all")}
            disabled={isPending}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              currentTab === "all"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            } ${isPending ? 'opacity-70' : ''}`}
          >
            All Users
          </button>
          <button
            onClick={() => handleTabChange("internal")}
            disabled={isPending}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              currentTab === "internal"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            } ${isPending ? 'opacity-70' : ''}`}
          >
            Internal User
          </button>
          <button
            onClick={() => handleTabChange("broker")}
            disabled={isPending}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              currentTab === "broker"
                ? "bg-white text-purple-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            } ${isPending ? 'opacity-70' : ''}`}
          >
            Broker Agent
          </button>
          <button
            onClick={() => handleTabChange("banned")}
            disabled={isPending}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              currentTab === "banned"
                ? "bg-white text-red-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            } ${isPending ? 'opacity-70' : ''}`}
          >
            Banned
          </button>
          
          {isPending && (
             <div className="absolute -right-8 top-1/2 -translate-y-1/2">
               <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
             </div>
          )}
        </div>

        {/* Page Size */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-sm text-gray-500">Show:</span>
          <select
            value={currentLimit}
            onChange={(e) => handleLimitChange(e.target.value)}
            disabled={isPending}
            className="text-sm border-gray-300 border rounded-md focus:ring-primary focus:border-primary py-1.5 pl-2 pr-8 disabled:opacity-50"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          placeholder="Search by name, email, or phone..."
          defaultValue={currentSearch}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        {isPending && (
           <div className="absolute right-3 top-1/2 -translate-y-1/2">
             <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
           </div>
        )}
      </div>
    </div>
  );
}
