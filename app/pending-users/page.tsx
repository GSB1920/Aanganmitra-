import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import SubmitButton from "@/components/ui/submit-button";
import { sendEmail } from "../../lib/email";
import { Check, X, User, Mail, Phone, Clock, AlertCircle, Shield, ArrowLeft, Filter, Search, RefreshCw } from "lucide-react";
import Link from "next/link";
import { syncProfilesAction } from "@/app/action/admin/syncProfiles";

export default async function PendingUsersPage() {
  const supabase = await supabaseServer();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <Shield className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h2>
        <p className="text-gray-600 mb-6">Please log in to access this page.</p>
        <Link 
          href="/login" 
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (me?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <Shield className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You do not have permission to view this page.</p>
      </div>
    );
  }

  const { data: pending, error } = await supabase
    .from("profiles")
    .select("id, name, email, phone, approved, role, created_at")
    .eq("approved", false)
    .neq("role", "banned")
    .order("created_at", { ascending: false });

  if (error) return (
    <div className="p-6 text-center">
      <div className="bg-red-50 inline-flex p-3 rounded-full mb-3">
        <AlertCircle className="w-6 h-6 text-red-500" />
      </div>
      <p className="text-red-600">{error.message}</p>
    </div>
  );

  async function approveUser(formData: FormData) {
    "use server";
    const s = await supabaseServer();
    const { data: { user: admin } } = await s.auth.getUser();
    if (!admin) return;
    const { data: prof } = await s.from("profiles").select("role").eq("id", admin.id).maybeSingle();
    if (prof?.role !== "admin") return;
    const id = formData.get("id") as string;
    const role = formData.get("role") as string || "broker";
    
    // 1. Approve in profiles table
    await s.from("profiles").update({ approved: true, role: role }).eq("id", id);
    
    // 2. Confirm email in Supabase Auth (so they can login without clicking email link)
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, { 
      email_confirm: true 
    });
    
    if (authError) {
      console.error("Failed to confirm email for user:", id, authError);
    }

    const { data: u } = await s.from("profiles").select("email,name").eq("id", id).maybeSingle();
    if (u?.email) {
      await sendEmail(u.email, "Your account is approved", `<p>Hi ${u.name || ""}, your account has been approved. You can now log in.</p>`);
    }
  }

  async function rejectUser(formData: FormData) {
    "use server";
    const s = await supabaseServer();
    const { data: { user: admin } } = await s.auth.getUser();
    if (!admin) return;
    const { data: prof } = await s.from("profiles").select("role").eq("id", admin.id).maybeSingle();
    if (prof?.role !== "admin") return;
    const id = formData.get("id") as string;
    const { data: u } = await s.from("profiles").select("email,name").eq("id", id).maybeSingle();
    if (u?.email) {
      await sendEmail(u.email, "Your account review result", `<p>Hi ${u.name || ""}, your account was not approved at this time.</p>`);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-sm text-gray-500 mt-1">Review and manage user registration requests</p>
        </div>
        <Link 
          href="/properties"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              placeholder="Search users..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <button className="inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2 text-gray-500" />
            Filter
          </button>
          
          <form action={async () => {
              "use server";
              await syncProfilesAction();
           }}>
              <SubmitButton 
                className="inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
                variant="secondary"
              >
                 <RefreshCw className="w-4 h-4 mr-2 text-gray-500" />
                 Sync Data
              </SubmitButton>
           </form>
        </div>

        {!pending || pending.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
            <p className="text-gray-500 mt-1">There are no pending user approvals at the moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Info</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Requested</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pending.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{u.name || "Unknown Name"}</div>
                          <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize mt-1">
                            {u.role || "user"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-gray-400" /> {u.email}
                        </div>
                        {u.phone && (
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-gray-400" /> {u.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span title={new Date(u.created_at).toLocaleString()}>
                          {new Date(u.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <form action={approveUser} className="flex items-center gap-2">
                          <input type="hidden" name="id" value={u.id} />
                          <select 
                            name="role" 
                            className="block w-full max-w-[140px] pl-2 pr-8 py-1.5 text-xs border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md shadow-sm"
                            defaultValue="broker"
                          >
                            <option value="broker">Broker Agent</option>
                            <option value="internal">Internal User</option>
                          </select>
                          <SubmitButton className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm transition-colors" variant="primary" size="sm">
                            <Check className="w-3 h-3 mr-1.5" /> Approve
                          </SubmitButton>
                        </form>
                        <form action={rejectUser}>
                          <input type="hidden" name="id" value={u.id} />
                          <SubmitButton className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500" variant="danger" size="sm">
                            <X className="w-3 h-3 mr-1.5" /> Reject
                          </SubmitButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
