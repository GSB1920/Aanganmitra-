import { supabaseServer } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import LoadingButton from "@/components/ui/loading-button";
import SubmitButton from "@/components/ui/submit-button";
import ImageWithLoader from "@/components/ui/image-with-loader";
import Carousel from "@/components/ui/carousel";

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
      <div className="p-10">
        <h1 className="text-xl font-semibold">Property Not Found</h1>
        <Link href="/properties" className="text-blue-600 underline">
          Go Back
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
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/properties" className="text-blue-600 underline">
          ← Back to List
        </Link>
        <div className="flex gap-2">
          <LoadingButton href={`/properties/${property.id}/edit`} variant="primary">Edit</LoadingButton>
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
            <SubmitButton variant="danger">Delete</SubmitButton>
          </form>
        </div>
      </div>

      <div className="space-y-6 bg-white border rounded-md shadow p-6">
        <h1 className="text-2xl font-semibold">{property.title}</h1>

        <Carousel images={images} className="w-full max-w-[480px] h-[300px]" />

        <hr />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div><span className="font-medium">City:</span> {property.city}</div>
            <div><span className="font-medium">Address:</span> {property.address || "-"}</div>
            <div><span className="font-medium">Area:</span> {property.area || "-"}</div>
            <div><span className="font-medium">Zoning:</span> {property.zoning || "-"}</div>
            <div><span className="font-medium">Type:</span> {property.property_type || "-"}</div>
          </div>
          <div className="space-y-2">
            <div><span className="font-medium">Area (sqft):</span> {property.area_sqft ?? "-"}</div>
            <div><span className="font-medium">Rate / sqft:</span> {property.rate_per_sqft ?? "-"}</div>
            <div><span className="font-medium">RERA:</span> {property.rera ? "Yes" : "No"}</div>
            <div><span className="font-medium">Asking Price:</span> {typeof property.asking_price === "number" ? formatINR.format(property.asking_price) : "-"}</div>
            <div><span className="font-medium">Final Price:</span> {typeof property.final_price === "number" ? formatINR.format(property.final_price) : "-"}</div>
          </div>
        </div>

        <hr />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div><span className="font-medium">Owner Name:</span> {property.owner_name || "-"}</div>
            <div><span className="font-medium">Owner Phone:</span> {property.owner_phone || "-"}</div>
          </div>
          <div className="space-y-2">
            <div><span className="font-medium">Owner Address:</span> {property.owner_address || "-"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
