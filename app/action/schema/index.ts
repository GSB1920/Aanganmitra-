"use server";

import { supabaseServer, supabaseServerWritable } from "@/lib/supabase/server";
import { FormSchema } from "@/types/form-schema";

export async function getFormSchema(formKey: string, version?: string) {
  const supabase = supabaseServer();

  let query = supabase
    .from("form_schemas")
    .select("*")
    .eq("form_key", formKey);

  if (version) {
    query = query.eq("version", version);
  } else {
    // Get latest active
    query = query.eq("status", "ACTIVE").order("version", { ascending: false }).limit(1);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    // If no schema exists, we can return a default template based on the key
    // This acts as an auto-seed for new keys like PROPERTY_INTERNAL or PROPERTY_BROKER
    if (!version && (!error || error.code === 'PGRST116')) { // PGRST116 is "The result contains 0 rows"
       const defaultSchema = createDefaultSchema(formKey);
       return { schema: defaultSchema };
    }
    
    console.error("Error fetching schema:", error);
    return { error: error?.message || "Schema not found" };
  }

  // Map DB snake_case to TS camelCase
  const schema: FormSchema = {
    ...data,
    formKey: data.form_key,
    version: data.version,
    steps: data.steps,
    status: data.status,
    id: data.id,
    created_at: data.created_at,
    updated_at: data.updated_at
  };

  return { schema };
}

function createDefaultSchema(formKey: string): FormSchema {
  return {
    formKey,
    version: "v1",
    status: "ACTIVE",
    steps: [
      {
        stepId: "basic_info",
        title: "Basic Info",
        description: "Start with essential details",
        fields: [
          {
            key: "title",
            type: "text",
            label: "Property Title",
            placeholder: "e.g. 2BHK Apartment in Indiranagar",
            validation: { required: true },
            className: "col-span-2"
          },
          {
            key: "asking_price",
            type: "number",
            label: "Asking Price (₹)",
            placeholder: "e.g. 5000000",
            validation: { required: true, min: 0 }
          },
          {
            key: "property_type",
            type: "select",
            label: "Property Type",
            options: [
              { label: "Apartment", value: "apartment" },
              { label: "Villa", value: "villa" },
              { label: "Plot", value: "plot" },
              { label: "Commercial", value: "commercial" }
            ],
            validation: { required: true }
          }
        ]
      },
      {
        stepId: "location",
        title: "Location",
        description: "Where is the property located?",
        fields: [
          {
            key: "city",
            type: "text",
            label: "City",
            placeholder: "e.g. Bangalore",
            validation: { required: true }
          },
          {
            key: "location_map",
            type: "map",
            label: "Pin Location",
            className: "col-span-2"
          }
        ]
      }
    ]
  };
}

export async function seedInitialSchema() {
  const supabase = await supabaseServerWritable();
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Unauthorized: Only admins can manage schemas" };
  }
  
  // Check if schema exists
  const { data: existing } = await supabase
    .from("form_schemas")
    .select("id")
    .eq("form_key", "PROPERTY")
    .eq("version", "v1")
    .single();

  if (existing) {
    return { message: "Schema v1 already exists" };
  }

  const initialSchema: FormSchema = {
    formKey: "PROPERTY",
    version: "v1",
    status: "ACTIVE",
    steps: [
      {
        stepId: "basic_info",
        title: "Basic Info",
        description: "Essential details about the property",
        fields: [
          {
            key: "title",
            type: "text",
            label: "Property Title",
            placeholder: "e.g. 3BHK Apartment in Indiranagar",
            validation: { required: true },
            className: "col-span-2"
          },
          {
            key: "property_type",
            type: "select",
            label: "Property Type",
            options: [
              { label: "Apartment", value: "apartment" },
              { label: "Villa", value: "villa" },
              { label: "Plot", value: "plot" },
              { label: "Commercial", value: "commercial" }
            ],
            validation: { required: true }
          },
          {
            key: "listing_type",
            type: "select",
            label: "Listing Type",
            options: [
              { label: "Sell", value: "sale" },
              { label: "Rent", value: "rent" },
              { label: "Lease", value: "lease" }
            ],
            validation: { required: true }
          }
        ]
      },
      {
        stepId: "location",
        title: "Location",
        description: "Where is the property located?",
        fields: [
          {
            key: "city",
            type: "text",
            label: "City",
            validation: { required: true }
          },
          {
            key: "area",
            type: "text",
            label: "Area / Locality",
            validation: { required: true }
          },
          {
            key: "address",
            type: "textarea",
            label: "Full Address",
            validation: { required: true },
            className: "col-span-2"
          }
        ]
      },
      {
        stepId: "details",
        title: "Property Details",
        fields: [
          {
            key: "asking_price",
            type: "number",
            label: "Asking Price (₹)",
            validation: { required: true, min: 0 }
          },
          {
            key: "area_sqft",
            type: "number",
            label: "Area (sqft)",
            validation: { required: true, min: 1 }
          },
          {
            key: "bhk",
            type: "select",
            label: "BHK Configuration",
            options: [
               { label: "1 RK", value: "1rk" },
               { label: "1 BHK", value: "1bhk" },
               { label: "2 BHK", value: "2bhk" },
               { label: "3 BHK", value: "3bhk" },
               { label: "4+ BHK", value: "4bhk" }
            ],
            visibility: { roles: ["admin", "internal", "broker"] } // Visible to all, but just demonstrating structure
          }
        ]
      }
    ]
  };

  const { error } = await supabase.from("form_schemas").insert({
    form_key: initialSchema.formKey,
    version: initialSchema.version,
    status: initialSchema.status,
    steps: initialSchema.steps
  });

  if (error) return { error: error.message };
  return { success: true };
}
