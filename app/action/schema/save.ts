"use server";

import { supabaseServerWritable } from "@/lib/supabase/server";
import { FormSchema } from "@/types/form-schema";
import { revalidatePath } from "next/cache";

export async function saveSchema(schema: FormSchema) {
  const supabase = await supabaseServerWritable();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Verify Admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Unauthorized" };
  }

  // Determine new version
  // Simple logic: If current is v1, next is v2. 
  // We can also let the client decide, but safer here.
  const { data: latest } = await supabase
    .from("form_schemas")
    .select("version")
    .eq("form_key", schema.formKey)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let nextVersion = "v1";
  if (latest) {
    const currentVer = parseInt(latest.version.replace("v", ""));
    if (!isNaN(currentVer)) {
      nextVersion = `v${currentVer + 1}`;
    }
  }

  const payload = {
    form_key: schema.formKey,
    version: nextVersion,
    steps: schema.steps,
    status: "ACTIVE"
  };

  const { error } = await supabase
    .from("form_schemas")
    .insert(payload);

  if (error) {
    console.error("Save schema error:", error);
    return { error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/properties/add-dynamic");
  
  return { success: true, version: nextVersion };
}