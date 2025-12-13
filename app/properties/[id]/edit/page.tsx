import { supabaseServer } from "@/lib/supabase/server";
import { updatePropertyAction } from "../../../action/properties/updateProperty";
import Link from "next/link";
import ImageUploader from "./image-uploader";
import { UploadProvider } from "@/components/ui/upload-context";
import SaveSubmit from "@/components/ui/save-submit";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function EditPropertyPage(
  { params, searchParams }: { 
    params: { id: string }; 
    searchParams?: Record<string, string | string[] | undefined>;
  }
) {
  const supabase = await supabaseServer();
    
  const errorMessage = searchParams?.error as string | undefined;

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!property) {
    return (
      <div className="p-10">
        <h1 className="text-xl font-semibold">Property Not Found</h1>
        <Link className="text-blue-600 underline" href="/properties">
          Go Back
        </Link>
      </div>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || property.created_by !== user.id) {
    return (
      <div className="p-10">
        <h1 className="text-xl font-semibold">Access Denied</h1>
        <p className="text-gray-600">You can only edit your own properties.</p>
        <Link className="text-blue-600 underline" href="/properties">Go Back</Link>
      </div>
    );
  }

  async function uploadPhoto(formData: FormData) {
    "use server";
    const s = await supabaseServer();
    const { data: { user: u } } = await s.auth.getUser();
    if (!u) return;
    const propertyId = formData.get("property_id") as string;
    if (!propertyId) return;
    const { data: own } = await s
      .from("properties")
      .select("created_by")
      .eq("id", propertyId)
      .maybeSingle();
    if (!own || own.created_by !== u.id) return;
    const file = formData.get("file") as File | null;
    if (!file) return;

    const bucket = "property-images";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const path = `${propertyId}/${fileName}`;

    const { error: uploadErr } = await s.storage
      .from(bucket)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadErr) return;

    await s.from("property_photos").insert({
      property_id: propertyId,
      image_url: path,
      order_index: Date.now(),
    });
  }

  async function save(formData: FormData) {
    "use server";
    await updatePropertyAction(params.id, formData);
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-semibold">Edit Property</h1>

      {errorMessage && (
        <p className="text-red-600">{errorMessage}</p>
      )}

      <UploadProvider>
        <form action={save} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Property Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="title" className="text-sm font-medium">Title</label>
                  <input id="title" name="title" defaultValue={property.title} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" aria-required="true" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="city" className="text-sm font-medium">City</label>
                  <input id="city" name="city" defaultValue={property.city ?? ""} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" aria-required="true" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="property_type" className="text-sm font-medium">Type</label>
                  <input id="property_type" name="property_type" defaultValue={property.property_type || ""} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="area_sqft" className="text-sm font-medium">Area (sqft)</label>
                  <input id="area_sqft" name="area_sqft" type="number" defaultValue={property.area_sqft ?? ""} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="address" className="text-sm font-medium">Address</label>
                <textarea id="address" name="address" defaultValue={property.address || ""} rows={3} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Owner & Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="owner_name" className="text-sm font-medium">Owner Name</label>
                  <input id="owner_name" name="owner_name" defaultValue={property.owner_name || ""} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="owner_phone" className="text-sm font-medium">Owner Phone</label>
                  <input id="owner_phone" name="owner_phone" defaultValue={property.owner_phone || ""} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="asking_price" className="text-sm font-medium">Asking Price (INR)</label>
                  <input id="asking_price" name="asking_price" type="number" defaultValue={property.asking_price ?? ""} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" aria-required="true" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="final_price" className="text-sm font-medium">Final Price (INR)</label>
                  <input id="final_price" name="final_price" type="number" defaultValue={property.final_price ?? ""} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <SaveSubmit />
          </div>
        </form>

        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploader propertyId={params.id} onUpload={uploadPhoto} onUploadingChange={(u) => window.dispatchEvent(new CustomEvent("uploading_change", { detail: u }))} />
          </CardContent>
        </Card>
      </UploadProvider>
    </div>
  );
}
