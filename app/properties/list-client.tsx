"use client";

import { useEffect, useMemo, useRef, useState } from "react";
 
import Link from "next/link";
import LoadingButton from "@/components/ui/loading-button";
import Modal from "@/components/ui/modal";
import ImageWithLoader from "@/components/ui/image-with-loader";
import Carousel from "@/components/ui/carousel";
import { Search, Filter, MapPin, Ruler, Home, ArrowUpDown, ChevronDown, Building2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Property = {
  id: string;
  title: string;
  city: string | null;
  property_type: string | null;
  listing_type: string | null;
  area_sqft: number | null;
  asking_price: number | null;
};

 

export default function PropertiesListClient() {
  const [items, setItems] = useState<Property[]>([]);
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [photosMap, setPhotosMap] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<string>("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const formatINR = useMemo(
    () => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }),
    []
  );

  async function loadPage(reset = false) {
    if (loading) return;
    setLoading(true);

    const limit = 12;
    const params = new URLSearchParams({
      page: String(reset ? 0 : page),
      limit: String(limit),
    });
    if (query.trim()) params.set("q", query.trim());
    if (sort) params.set("sort", sort);

    const res = await fetch(`/api/my/properties?${params.toString()}`);
    if (!res.ok) {
      setLoading(false);
      setHasMore(false);
      return;
    }
    const json = await res.json();
    const data: Property[] = json.items ?? [];
    const covers: Record<string, string> = json.covers ?? {};
    const map: Record<string, string[]> = json.photosMap ?? {};

    const newItems = reset ? data : [...items, ...data];
    setItems(newItems);
    setPage(reset ? 1 : page + 1);
    setHasMore(data.length === limit);
    setPhotos({ ...photos, ...covers });
    setPhotosMap({ ...photosMap, ...map });

    setLoading(false);
  }

  useEffect(() => {
    loadPage(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      setPage(0);
      loadPage(true);
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sort]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      const e = entries[0];
      if (e.isIntersecting && hasMore && !loading) loadPage();
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loading]);

  function openFilters() {
    setFiltersOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm" 
            placeholder="Search properties by title, location..." 
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <select 
              value={sort} 
              onChange={(e) => setSort(e.target.value)} 
              className="appearance-none w-full md:w-48 pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="area_desc">Area: Large to Small</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
          <button 
            onClick={openFilters} 
            className="flex items-center px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 bg-white"
          >
            <Filter className="w-4 h-4 mr-2 text-gray-500" />
            Filters
          </button>
        </div>
      </div>

      {/* Empty State */}
      {items.length === 0 && !loading && (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No properties found</h3>
          <p className="text-gray-500 mt-1 max-w-sm mx-auto">
            We couldn't find any properties matching your search. Try adjusting your filters or search terms.
          </p>
          <button 
            onClick={() => { setQuery(""); setSort("newest"); }}
            className="mt-4 text-primary font-medium hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((p) => (
          <div key={p.id} className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full hover:-translate-y-1">
            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
              <Carousel
                images={
                  photosMap[p.id] && photosMap[p.id].length > 0
                    ? photosMap[p.id]
                    : (photos[p.id] ? [photos[p.id]] : [])
                }
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3">
                 <span className="bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm border border-gray-100 flex items-center uppercase tracking-wide">
                   <Home className="w-3 h-3 mr-1 text-primary" />
                   {p.property_type || "Property"}
                 </span>
              </div>
              <div className="absolute top-3 right-3">
                 <span className={cn(
                   "backdrop-blur-sm text-xs font-bold px-2.5 py-1 rounded-md shadow-sm border flex items-center uppercase tracking-wide",
                   p.listing_type === 'rental' 
                     ? "bg-blue-50/95 text-blue-700 border-blue-100" 
                     : "bg-green-50/95 text-green-700 border-green-100"
                 )}>
                   {p.listing_type === 'rental' ? 'Rent' : 'Sale'}
                 </span>
              </div>
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-16">
                <p className="text-white font-bold text-xl leading-tight drop-shadow-sm">
                  {typeof p.asking_price === "number" ? formatINR.format(p.asking_price) : "Price on Request"}
                </p>
              </div>
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-gray-900 mb-1 truncate text-lg group-hover:text-primary transition-colors" title={p.title}>{p.title}</h3>
              
              <div className="flex items-center text-gray-500 text-sm mb-4">
                <MapPin className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-gray-400" />
                <span className="truncate">{p.city || "Location not specified"}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-auto pt-3 border-t border-gray-100">
                 <div className="flex items-center text-gray-600 text-sm">
                   <Ruler className="w-4 h-4 mr-2 text-gray-400" />
                   <span className="font-medium">{p.area_sqft ? p.area_sqft.toLocaleString() : "-"}</span>
                   <span className="text-xs ml-1 text-gray-400">sqft</span>
                 </div>
                 
                 <div className="flex justify-end">
                   <Link 
                     href={`/properties/${p.id}`}
                     className="text-primary text-sm font-medium hover:text-primary/80 flex items-center group/link"
                   >
                     View Details
                    <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover/link:translate-x-0.5" />
                  </Link>
                 </div>
              </div>
            </div>
          </div>
        ))}
        
        {items.length === 0 && loading && [...Array(8)].map((_, i) => (
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

      <div ref={sentinelRef} className="h-4" />

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
            <span className="text-sm text-gray-500">Loading properties...</span>
          </div>
        </div>
      )}

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
        <div className="p-4">
          <p className="text-gray-500 text-center">Advanced filters coming soon</p>
        </div>
      </Modal>
    </div>
  );
}
