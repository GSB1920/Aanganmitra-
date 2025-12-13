import { supabaseServer } from "@/lib/supabase/server";
import SubmitButton from "@/components/ui/submit-button";

export default async function ProfilePage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div className="p-6">
        <p className="text-gray-700">You need to log in to view your profile.</p>
        <a href="/login" className="text-blue-600 underline">Login</a>
      </div>
    );
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, name, phone, email")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return <p className="text-red-600">Failed to load profile: {error.message}</p>;
  }

  async function updateProfile(formData: FormData) {
    "use server";
    const s = await supabaseServer();
    const { data: { user: u } } = await s.auth.getUser();
    if (!u) return;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    await s.from("profiles").update({ name, phone }).eq("id", u.id);
  }

  return (
    <div className="max-w-xl mx-auto bg-white border rounded p-6 shadow">
      <h1 className="text-2xl font-semibold mb-4">Your Profile</h1>

      <form action={updateProfile} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input id="email" defaultValue={profile?.email ?? ""} readOnly className="w-full p-2 border rounded bg-gray-100" />
          <p className="text-xs text-gray-500">Email cannot be changed.</p>
        </div>
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Full Name</label>
          <input id="name" name="name" defaultValue={profile?.name ?? ""} className="w-full p-2 border rounded" />
        </div>
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
          <input id="phone" name="phone" defaultValue={profile?.phone ?? ""} className="w-full p-2 border rounded" />
        </div>
        <div className="flex justify-end">
          <SubmitButton variant="primary">Save</SubmitButton>
        </div>
      </form>
    </div>
  );
}
