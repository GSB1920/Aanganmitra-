import { supabaseServer } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import LoadingButton from "@/components/ui/loading-button";
import SubmitButton from "@/components/ui/submit-button";
import ImageWithLoader from "@/components/ui/image-with-loader";
import Carousel from "@/components/ui/carousel";
import LocationPicker from "@/components/ui/location-picker";
import { MapPin, Ruler, Home, IndianRupee, User, Phone, Map, Trash2, Edit, ChevronLeft, Building2, CheckCircle2, Navigation } from "lucide-react";

export default async function PropertyViewPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await supabaseServer();

  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", params.id)
    .single();

  const { data: photos } = await supabase
    .from("property_photos")
    .select("image_url, order_index")
    .eq("property_id", params.id)
    .order("order_index", { ascending: true });

  let storageImages: string[] = [];
  if (!photos || photos.length === 0) {
    const bucket = "property-images";
    const { data: files } = await supabase.storage.from(bucket).list(`${params.id}`, { limit: 100 });
    if (files && files.length > 0) {
      storageImages = (
        await Promise.all(
          files.map(async (f) => {
            const p = `${params.id}/${f.name}`;
            const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(p, 3600);
            return signed?.signedUrl ?? "";
          })
        )
      ).filter(Boolean);
    }
  }

  if (error || !property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-10 text-center">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <Home className="w-8 h-8 text-gray-500" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Property Not Found</h1>
        <p className="text-gray-500 mb-6">The property you are looking for does not exist or has been removed.</p>
        <Link href="/properties" className="text-primary font-medium hover:underline flex items-center">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Properties
        </Link>
      </div>
    );
  }

  const formatINR = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  const bucket = "property-images";
  const images = (photos && photos.length > 0)
    ? await Promise.all(
        photos.map(async (p) => {
          const raw = p.image_url || "";
          const match = raw.match(/\/property-images\/(.+)$/);
          const rel = match ? match[1] : raw; // supports stored path or old public url
          const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(rel, 3600);
          return signed?.signedUrl ?? raw;
        })
      )
    : (storageImages.length > 0
      ? storageImages
      : [
        "https://placehold.co/800x500/png?text=No+Image",
        "https://placehold.co/800x500/png?text=No+Image",
        "https://placehold.co/800x500/png?text=No+Image",
      ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/properties" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors" title="Back to list">
            <ChevronLeft className="w-6 h-6 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 truncate max-w-xl">{property.title}</h1>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              {property.city} {property.address && `• ${property.address}`}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <LoadingButton href={`/properties/${property.id}/edit`} variant="secondary" className="shadow-sm border border-gray-300">
            <Edit className="w-4 h-4 mr-2" /> Edit
          </LoadingButton>
          <form
            action={async () => {
              "use server";
              const s = await supabaseServer();
              const { data: { user } } = await s.auth.getUser();
              if (!user) return;
              const { data: own } = await s
                .from("properties")
                .select("created_by")
                .eq("id", property.id)
                .maybeSingle();
              if (!own || own.created_by !== user.id) return;
              await s.from("property_photos").delete().eq("property_id", property.id);
              const bucket = "property-images";
              const { data: files } = await s.storage.from(bucket).list(`${property.id}`, { limit: 1000 });
              if (files && files.length > 0) {
                const paths = files.map((f) => `${property.id}/${f.name}`);
                await s.storage.from(bucket).remove(paths);
              }
              await s.from("properties").delete().eq("id", property.id);
              redirect("/properties");
            }}
          >
            <SubmitButton variant="danger" className="shadow-sm">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </SubmitButton>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <Carousel images={images} className="w-full aspect-video bg-gray-100 object-contain" />
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-primary" />
              Property Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Listing Type</label>
                  <p className="font-medium text-gray-900 capitalize flex items-center mt-1">
                    {property.listing_type === 'rental' ? 'For Rent' : 'For Sale'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Property Type</label>
                  <p className="font-medium text-gray-900 capitalize flex items-center mt-1">
                    {property.property_type || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Zoning</label>
                  <p className="font-medium text-gray-900 capitalize mt-1">{property.zoning || "-"}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Address</label>
                  <p className="font-medium text-gray-900 mt-1">{property.address || "-"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Area Size</label>
                  <p className="font-medium text-gray-900 flex items-center mt-1">
                    <Ruler className="w-4 h-4 mr-2 text-gray-400" />
                    {property.area_sqft ? `${property.area_sqft.toLocaleString()} sqft` : "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Rate per sqft</label>
                  <p className="font-medium text-gray-900 mt-1">
                    {property.rate_per_sqft ? formatINR.format(property.rate_per_sqft) : "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">RERA Registered</label>
                  <p className="font-medium text-gray-900 flex items-center mt-1">
                    {property.rera ? (
                      <><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Yes</>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Map */}
          {property.latitude && property.longitude && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary" />
                  Location Map
                </h2>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </a>
              </div>
              <LocationPicker 
                latitude={property.latitude} 
                longitude={property.longitude} 
                readOnly={true}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
           {/* Price Card */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm text-gray-500 mb-1">Asking Price</div>
              <div className="text-3xl font-bold text-primary mb-2">
                {typeof property.asking_price === "number" ? formatINR.format(property.asking_price) : "Price on Request"}
              </div>
              {typeof property.final_price === "number" && (
                <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-3">
                  <span className="text-sm text-gray-500">Final Price</span>
                  <span className="font-medium text-gray-900">{formatINR.format(property.final_price)}</span>
                </div>
              )}
           </div>

           {/* Owner Card */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-500" /> 
                Owner Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{property.owner_name || "-"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <Phone className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{property.owner_phone || "-"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <Map className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-gray-900 text-sm">{property.owner_address || "-"}</p>
                  </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
