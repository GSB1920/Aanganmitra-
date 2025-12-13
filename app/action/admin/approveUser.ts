"use server";

import { supabaseServer } from "@/lib/supabase/server";

export async function approveUserAction(userId: string) {
  const supabase = await supabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { error: "You are not authorized." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ approved: true })
    .eq("id", userId);

  if (error) return { error: error.message };

  return { success: true };
}
