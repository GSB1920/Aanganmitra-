import { supabaseServer } from "@/lib/supabase/server";
import SubmitButton from "@/components/ui/submit-button";
import { sendEmail } from "../../lib/email";

export default async function PendingUsersPage() {
  const supabase = await supabaseServer();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log("SESSION_CHECK", { userId: user?.id, email: user?.email, error: userError });
  if (!user) {
    return <p className="p-6">Login required.</p>;
  }

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  console.log("ADMIN_CHECK", { me });

  if (me?.role !== "admin") {
    return <p className="p-6 text-red-600">Access denied. Admins only.</p>;
  }

  const { data: rlsTestData, error: rlsTestError } = await supabase
    .from("profiles")
    .select("id, role")
    .limit(5);
  console.log("RLS_TEST", { data: rlsTestData, error: rlsTestError });

  const { data: pending, error } = await supabase
    .from("profiles")
    .select("id, name, email, phone, approved, role, created_at")
    .eq("approved", false)
    .order("created_at", { ascending: false });

  console.log("RAW RESPONSE", { pending, error });

  if (error) return <p className="text-red-600">{error.message}</p>;

  async function approveUser(formData: FormData) {
    "use server";
    const s = await supabaseServer();
    const { data: { user: admin } } = await s.auth.getUser();
    if (!admin) return;
    const { data: prof } = await s.from("profiles").select("role").eq("id", admin.id).maybeSingle();
    if (prof?.role !== "admin") return;
    const id = formData.get("id") as string;
    await s.from("profiles").update({ approved: true }).eq("id", id);
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
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Pending Users</h1>
      {!pending || pending.length === 0 ? (
        <>
          <p className="text-gray-600">No pending users.</p>
          <div className="mt-4 bg-gray-50 border rounded p-3 text-xs overflow-auto">
            <div className="font-medium mb-1">Debug</div>
            <pre className="whitespace-pre-wrap break-all">{JSON.stringify({ admin: me, response: { pending, error } }, null, 2)}</pre>
          </div>
        </>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg shadow text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border text-left">Name</th>
                <th className="p-3 border text-left">Email</th>
                <th className="p-3 border text-left">Phone</th>
                <th className="p-3 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((u) => (
                <tr key={u.id}>
                  <td className="p-3 border">{u.name}</td>
                  <td className="p-3 border">{u.email}</td>
                  <td className="p-3 border">{u.phone}</td>
                  <td className="p-3 border text-center">
                    <form action={approveUser} className="inline-block mr-2">
                      <input type="hidden" name="id" value={u.id} />
                      <SubmitButton className="px-3 py-1" variant="primary">Approve</SubmitButton>
                    </form>
                    <form action={rejectUser} className="inline-block">
                      <input type="hidden" name="id" value={u.id} />
                      <SubmitButton className="px-3 py-1" variant="danger">Reject</SubmitButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 bg-gray-50 border rounded p-3 text-xs overflow-auto">
            <div className="font-medium mb-1">Debug</div>
            <pre className="whitespace-pre-wrap break-all">{JSON.stringify({ admin: me, response: { pending, error } }, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
