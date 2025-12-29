"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function syncProfilesAction(formData?: FormData) {
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

  // Fetch all auth users
  const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (authError) return { error: authError.message };

  // Fetch all profiles
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from("profiles")
    .select("id");

  if (profilesError) return { error: profilesError.message };

  const profileIds = new Set(profiles?.map(p => p.id) || []);
  const missingUsers = users.filter(u => !profileIds.has(u.id));

  let syncedCount = 0;

  for (const u of missingUsers) {
    // Extract metadata
    const name = u.user_metadata?.name || u.email?.split("@")[0] || "Unknown";
    const phone = u.user_metadata?.phone || "";
    
    const { error: insertError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: u.id,
        email: u.email,
        name: name,
        phone: phone,
        approved: false, // Default to false so admin sees them in pending
        role: "user",
        created_at: u.created_at
      });

    if (!insertError) {
      syncedCount++;
    } else {
      console.error(`Failed to sync profile for user ${u.id}:`, insertError);
    }
  }

  // Fix: Confirm emails for users who are approved in 'profiles' but not in Auth
  const { data: approvedProfiles } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("approved", true);

  const approvedIds = new Set(approvedProfiles?.map(p => p.id) || []);
  
  let fixedEmailCount = 0;
  
  for (const u of users) {
    if (approvedIds.has(u.id) && !u.email_confirmed_at) {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(u.id, {
            email_confirm: true
        });
        if (!updateError) {
          fixedEmailCount++;
        } else {
          console.error(`Failed to confirm email for user ${u.id}:`, updateError);
        }
    }
  }

  revalidatePath("/pending-users");
  return { success: true, count: syncedCount, fixedEmails: fixedEmailCount };
}
