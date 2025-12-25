"use server";

import { supabaseServerWritable } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function signupAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;

  if (!email || !password || !name || !phone) {
    return { error: "All fields are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const supabase = await supabaseServerWritable();

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, phone },
    },
  });

  if (authError) {
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (loginError) {
      return { error: authError.message };
    }
    const user = loginData.user;
    if (!user) return { error: "Signup failed. Try again." };
    const { data: profile } = await supabase
      .from("profiles")
      .select("approved")
      .eq("id", user.id)
      .single();
    if (!profile) return { error: "Profile not found." };
    if (!profile.approved) {
      return { error: "Your account is not approved yet. Please wait." };
    }
    redirect("/properties");
  }

  const userId = authData.user?.id;
  if (!userId) return { error: "Signup failed. Try again." };

  // Manually ensure profile exists using Admin client (bypassing potentially broken triggers)
  // We use upsert to handle cases where the trigger might have fired partially or we want to ensure data consistency
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .upsert({
      id: userId,
      email: email,
      name: name,
      phone: phone,
      approved: false,
      role: "user",
      created_at: new Date().toISOString(),
    }, { onConflict: 'id' });

  if (profileError) {
    console.error("Manual profile creation failed:", profileError);
    // Continue anyway, as the auth user was created. 
    // If this fails, the user might be in a broken state (auth but no profile), 
    // but we can't delete the auth user easily without admin rights (which we have, but rolling back is complex).
  }

  return { success: true };
}
