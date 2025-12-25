import { supabaseServer } from "@/lib/supabase/server";
import { updatePropertyAction } from "../../../action/properties/updateProperty";
import Link from "next/link";
import ImageUploader from "./image-uploader";
import { UploadProvider } from "@/components/ui/upload-context";
import SaveSubmit from "@/components/ui/save-submit";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Building2, MapPin, Home, Ruler, User, Phone, IndianRupee, ArrowLeft, Image as ImageIcon } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-10 text-center">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <Home className="w-8 h-8 text-gray-500" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Property Not Found</h1>
        <p className="text-gray-500 mb-6">The property you are looking for does not exist.</p>
        <Link className="text-primary hover:underline font-medium flex items-center" href="/properties">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Link>
      </div>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || property.created_by !== user.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-10 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <Home className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-6">You can only edit your own properties.</p>
        <Link className="text-primary hover:underline font-medium flex items-center" href="/properties">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Link>
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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Property</h1>
          <p className="text-gray-500 mt-1">Update property details and manage photos</p>
        </div>
        <Link 
          href={`/properties/${params.id}`}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Property
        </Link>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      <UploadProvider>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <form action={save} className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Property Information</h3>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium text-gray-700">Property Title</label>
                      <input 
                        id="title" 
                        name="title" 
                        defaultValue={property.title} 
                        required 
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                        placeholder="e.g. Luxury Apartment in Downtown"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="city" className="text-sm font-medium text-gray-700">City</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input 
                          id="city" 
                          name="city" 
                          defaultValue={property.city ?? ""} 
                          required 
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                          placeholder="Enter city"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Listing Type</label>
                      <div className="flex gap-4">
                        <label className="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                          <input type="radio" name="listing_type" value="sale" defaultChecked={property.listing_type !== 'rental'} className="w-4 h-4 text-primary focus:ring-primary" />
                          <span className="ml-2 text-gray-700 text-sm">For Sale</span>
                        </label>
                        <label className="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                          <input type="radio" name="listing_type" value="rental" defaultChecked={property.listing_type === 'rental'} className="w-4 h-4 text-primary focus:ring-primary" />
                          <span className="ml-2 text-gray-700 text-sm">For Rent</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="property_type" className="text-sm font-medium text-gray-700">Property Type</label>
                      <div className="relative">
                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input 
                          id="property_type" 
                          name="property_type" 
                          defaultValue={property.property_type || ""} 
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                          placeholder="Apartment, Villa, etc."
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="area_sqft" className="text-sm font-medium text-gray-700">Area (sqft)</label>
                      <div className="relative">
                        <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input 
                          id="area_sqft" 
                          name="area_sqft" 
                          type="number" 
                          defaultValue={property.area_sqft ?? ""} 
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="address" className="text-sm font-medium text-gray-700">Full Address</label>
                    <textarea 
                      id="address" 
                      name="address" 
                      defaultValue={property.address || ""} 
                      rows={3} 
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" 
                      placeholder="Enter detailed address"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <IndianRupee className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Owner & Pricing</h3>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="owner_name" className="text-sm font-medium text-gray-700">Owner Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input 
                          id="owner_name" 
                          name="owner_name" 
                          defaultValue={property.owner_name || ""} 
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                          placeholder="Name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="owner_phone" className="text-sm font-medium text-gray-700">Owner Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input 
                          id="owner_phone" 
                          name="owner_phone" 
                          defaultValue={property.owner_phone || ""} 
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                          placeholder="Phone"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="asking_price" className="text-sm font-medium text-gray-700">Asking Price (INR)</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input 
                          id="asking_price" 
                          name="asking_price" 
                          type="number" 
                          defaultValue={property.asking_price ?? ""} 
                          required 
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="final_price" className="text-sm font-medium text-gray-700">Final Price (INR)</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input 
                          id="final_price" 
                          name="final_price" 
                          type="number" 
                          defaultValue={property.final_price ?? ""} 
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <SaveSubmit />
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-8">
              <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Photos</h3>
              </div>
              <div className="p-6">
                <ImageUploader propertyId={params.id} onUpload={uploadPhoto} />
              </div>
            </div>
          </div>
        </div>
      </UploadProvider>
    </div>
  );
}
