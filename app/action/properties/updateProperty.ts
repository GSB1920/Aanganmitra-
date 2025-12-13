"use server";

import { supabaseServerWritable } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updatePropertyAction(id: string, formData: FormData) {
  const supabase = await supabaseServerWritable();

  const updates = {
    title: formData.get("title") as string,
    city: formData.get("city") as string,
    asking_price: Number(formData.get("asking_price")),
  };

  const { error } = await supabase
    .from("properties")
    .update(updates)
    .eq("id", id);

  if (error) {
    redirect(`/properties/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/properties");
}
