import { supabaseServerWritable } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Logout() {
  const supabase = await supabaseServerWritable();
  await supabase.auth.signOut();
  redirect("/");
}
