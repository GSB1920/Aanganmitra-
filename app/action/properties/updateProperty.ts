"use server";

import { supabaseServerWritable } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updatePropertyAction(id: string, formData: FormData) {
  const supabase = await supabaseServerWritable();

  const updates = {
    title: formData.get("title") as string,
    city: formData.get("city") as string,
    property_type: formData.get("property_type") as string,
    listing_type: formData.get("listing_type") as string,
    area_sqft: formData.get("area_sqft") ? Number(formData.get("area_sqft")) : null,
    address: formData.get("address") as string,
    owner_name: formData.get("owner_name") as string,
    owner_phone: formData.get("owner_phone") as string,
    asking_price: Number(formData.get("asking_price")),
    final_price: formData.get("final_price") ? Number(formData.get("final_price")) : null,
    latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null,
    longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null,
  };

  const { error } = await supabase
    .from("properties")
    .update(updates)
    .eq("id", id);

  if (error) {
    redirect(`/properties/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/properties/${id}`);
}
