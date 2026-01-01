"use server";

import { supabaseServerWritable } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createDynamicProperty(formData: FormData) {
  const formKey = formData.get("formKey") as string;
  const formVersion = formData.get("formVersion") as string;
  const dataString = formData.get("data") as string;
  
  if (!dataString) {
    return { error: "No data provided" };
  }

  const data = JSON.parse(dataString);
  const supabase = await supabaseServerWritable();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Map dynamic data to legacy columns for backward compatibility
  // This ensures the property shows up in existing lists and searches
  const legacyData = {
    title: data.title || "Untitled Property",
    city: data.city || "",
    area: data.area || "",
    address: data.address || "",
    property_type: data.property_type || "apartment",
    listing_type: data.listing_type || "sale",
    asking_price: Number(data.asking_price) || 0,
    area_sqft: Number(data.area_sqft) || 0,
    created_by: user.id,
    
    // New fields
    form_key: formKey,
    form_version: formVersion,
    data: data
  };

  const { error } = await supabase
    .from("properties")
    .insert(legacyData);

  if (error) {
    console.error("Error creating property:", error);
    return { error: error.message };
  }

  revalidatePath("/properties");
  return { success: true };
}

export async function updateDynamicProperty(formData: FormData) {
  const propertyId = formData.get("propertyId") as string;
  const formKey = formData.get("formKey") as string;
  const formVersion = formData.get("formVersion") as string;
  const dataString = formData.get("data") as string;
  
  if (!propertyId || !dataString) {
    return { error: "Missing property ID or data" };
  }

  const data = JSON.parse(dataString);
  const supabase = await supabaseServerWritable();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Verify ownership
  const { data: existing } = await supabase
    .from("properties")
    .select("created_by")
    .eq("id", propertyId)
    .single();

  if (!existing) return { error: "Property not found" };
  
  // Admin check could be added here if needed, but for now strict ownership
  // Or check profile role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = profile?.role === 'admin';
  
  if (existing.created_by !== user.id && !isAdmin) {
    return { error: "Unauthorized" };
  }

  // Map dynamic data to legacy columns
  const legacyUpdates: any = {
    updated_at: new Date().toISOString(),
    form_key: formKey, // Update if changed (unlikely but possible)
    form_version: formVersion, // Update version if schema changed
    data: data
  };

  // Only update legacy columns if they exist in the new data
  if (data.title) legacyUpdates.title = data.title;
  if (data.city) legacyUpdates.city = data.city;
  if (data.area) legacyUpdates.area = data.area;
  if (data.address) legacyUpdates.address = data.address;
  if (data.property_type) legacyUpdates.property_type = data.property_type;
  if (data.listing_type) legacyUpdates.listing_type = data.listing_type;
  if (data.asking_price) legacyUpdates.asking_price = Number(data.asking_price);
  if (data.area_sqft) legacyUpdates.area_sqft = Number(data.area_sqft);

  const { error } = await supabase
    .from("properties")
    .update(legacyUpdates)
    .eq("id", propertyId);

  if (error) {
    console.error("Error updating property:", error);
    return { error: error.message };
  }

  revalidatePath("/properties");
  revalidatePath(`/properties/${propertyId}`);
  return { success: true };
}
