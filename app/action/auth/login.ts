"use server";

import { supabaseServerWritable } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await supabaseServerWritable();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: error.message };

  const user = data.user;

  let { data: profile } = await supabase
    .from("profiles")
    .select("approved, role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    const name = (user.user_metadata as any)?.name ?? "";
    const phone = (user.user_metadata as any)?.phone ?? "";
    const email = user.email ?? "";
    const { error: insertError } = await supabase
      .from("profiles")
      .insert({ id: user.id, email, name, phone, approved: false });
    if (insertError) {
      return { error: "Profile creation failed. Please contact support." };
    }
    const { data: created } = await supabase
      .from("profiles")
      .select("approved, role")
      .eq("id", user.id)
      .single();
    profile = created || null;
  }

  if (!profile || !profile.approved) {
    return { error: "Your account is not approved yet. Please wait." };
  }

  if (profile.role === "banned") {
    return { error: "BANNED" };
  }

  redirect("/properties"); 
}
