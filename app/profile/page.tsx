import { supabaseServer } from "@/lib/supabase/server";
import SubmitButton from "@/components/ui/submit-button";
import GoogleMapsUsageCard from "@/components/ui/google-maps-usage-card";
import { User, Mail, Phone, Save, Shield, Camera } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h2>
        <p className="text-gray-600 mb-6">You need to log in to view your profile.</p>
        <Link 
          href="/login" 
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, name, phone, email, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return <p className="text-red-600 p-6">Failed to load profile: {error.message}</p>;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your personal information and account preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Avatar & Summary */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-6 text-center">
              <div className="relative inline-block mx-auto mb-4">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto border-4 border-white shadow-sm">
                  <User className="w-12 h-12" />
                </div>
                <button className="absolute bottom-0 right-0 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm text-gray-500 hover:text-primary transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{profile?.name || "User"}</h2>
              <p className="text-sm text-gray-500 mb-4">{profile?.email}</p>
              
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                <Shield className="w-3 h-3 mr-1" />
                {profile?.role || "User"}
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="md:col-span-2">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Account Details</h3>
              </div>
              
              <div className="p-6">
                <form action={updateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input 
                          id="email" 
                          defaultValue={profile?.email ?? ""} 
                          readOnly 
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none" 
                        />
                      </div>
                      <p className="text-xs text-gray-400">Email address cannot be changed for security reasons.</p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input 
                          id="name" 
                          name="name" 
                          defaultValue={profile?.name ?? ""} 
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input 
                          id="phone" 
                          name="phone" 
                          defaultValue={profile?.phone ?? ""} 
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end border-t border-gray-100 mt-6">
                    <SubmitButton variant="primary" className="flex items-center shadow-sm px-6">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </SubmitButton>
                  </div>
                </form>
              </div>
            </div>

            {/* Google Maps Usage Info (Admin/Owner Visibility) */}
            <GoogleMapsUsageCard />
          </div>
        </div>
      </div>
    </div>
  );
}
