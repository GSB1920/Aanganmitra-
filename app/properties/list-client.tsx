"use client";

import { useEffect, useMemo, useRef, useState } from "react";
 
import Link from "next/link";
import LoadingButton from "@/components/ui/loading-button";
import Modal from "@/components/ui/modal";
import ImageWithLoader from "@/components/ui/image-with-loader";
import Carousel from "@/components/ui/carousel";

type Property = {
  id: string;
  title: string;
  city: string | null;
  property_type: string | null;
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
    <div className="space-y-4">
      <div className="bg-white border rounded p-4 shadow flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-sm">Search</label>
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-64 p-2 border rounded" placeholder="Search by title" />
        </div>
        <div>
          <label className="text-sm">Sort</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-48 p-2 border rounded">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="area_desc">Area: Large to Small</option>
          </select>
        </div>
        <LoadingButton onClick={openFilters} variant="secondary">Filters</LoadingButton>
      </div>

      {items.length === 0 && !loading && (
        <p className="text-gray-600">No properties found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((p) => (
          <div key={p.id} className="bg-white rounded-xl shadow border overflow-hidden">
            <div className="relative h-40 bg-gray-100">
              {/* images */}
              <Carousel
                images={
                  photosMap[p.id] && photosMap[p.id].length > 0
                    ? photosMap[p.id]
                    : (photos[p.id] ? [photos[p.id]] : [])
                }
                className="w-full h-full"
              />
              {/* price badge */}
              {typeof p.asking_price === "number" && (
                <span className="absolute bottom-2 left-2 bg-black/70 text-white text-sm px-2 py-1 rounded">
                  {formatINR.format(p.asking_price)}
                </span>
              )}
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-semibold text-gray-900 truncate">{p.title}</h3>
              <div className="text-sm text-gray-700">{p.city || "-"} • {p.property_type || "-"}</div>
              <div className="text-sm text-gray-700">{p.area_sqft ? `${p.area_sqft} sqft` : "-"}</div>
              <div className="flex justify-end">
                <LoadingButton href={`/properties/${p.id}`} variant="primary">View</LoadingButton>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div ref={sentinelRef} className="h-12" />

      {loading && (
        <div className="flex items-center justify-center py-4 text-gray-600"><svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Loading...</div>
      )}

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
        Feature coming soon
      </Modal>
    </div>
  );
}
