"use server";

import { supabaseServerWritable } from "@/lib/supabase/server";
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

  // Profile row will be created by DB trigger using auth user metadata

  return { success: true };
}
