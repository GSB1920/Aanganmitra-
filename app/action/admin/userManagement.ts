"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function toggleBanUser(formData: FormData) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Check if admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const userId = formData.get("id") as string;
  const action = formData.get("action") as string; // "ban" or "unban"
  const previousRole = formData.get("previousRole") as string || "broker";

  if (!userId) return { error: "User ID required" };

  if (action === "ban") {
    // Ban user
    // 1. Update profile role to 'banned'
    const { error } = await supabase
      .from("profiles")
      .update({ role: "banned" })
      .eq("id", userId);

    if (error) return { error: error.message };

    // 2. Revoke sessions (optional but good security)
    await supabaseAdmin.auth.admin.signOut(userId);

  } else if (action === "unban") {
    // Unban user
    // Restore role. If we don't know the previous role, default to 'broker'.
    // Ideally we might store the previous role in metadata, but for now we'll ask the admin to set it or default to broker.
    // Simplification: Default to 'broker' for now.
    
    const { error } = await supabase
      .from("profiles")
      .update({ role: "broker" }) // Defaulting to broker on unban
      .eq("id", userId);

    if (error) return { error: error.message };
  }

  revalidatePath("/users");
  return { success: true };
}

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Unauthorized" };
  }

  if (!["admin", "internal", "broker", "user", "agent"].includes(newRole)) {
     // user/agent included for legacy support if needed, but UI should only offer admin/internal/broker
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/users");
  return { success: true };
}
