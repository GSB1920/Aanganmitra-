import { supabaseServer } from "@/lib/supabase/server";
import { Shield, Ban, CheckCircle, AlertTriangle, User, Search, RefreshCw, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import SubmitButton from "@/components/ui/submit-button";
import { toggleBanUser } from "@/app/action/admin/userManagement";
import RoleSelect from "@/components/admin/RoleSelect";

export default async function UsersTable({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await supabaseServer();

  // Params
  const page = Number(searchParams.page) || 0;
  const limit = Number(searchParams.limit) || 10;
  const query = (searchParams.q as string) || "";
  const roleFilter = (searchParams.role as string) || "";

  const from = page * limit;
  const to = from + limit - 1;

  // Build Query
  let dbQuery = supabase
    .from("profiles")
    .select("id, name, email, phone, approved, role, created_at", { count: "exact" });

  if (roleFilter) {
    dbQuery = dbQuery.eq("role", roleFilter);
  }

  if (query) {
    dbQuery = dbQuery.or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`);
  }

  // Pagination
  dbQuery = dbQuery
    .order("created_at", { ascending: false })
    .range(from, to);

  const { data: users, count, error } = await dbQuery;

  if (error) return <div className="p-6 text-red-600">{error.message}</div>;

  if (!users || users.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
        <div className="bg-gray-50 p-4 rounded-full mb-4">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
        <p className="text-gray-500 text-sm">
          {query ? `No users matching "${query}"` : "There are no users in this category yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users?.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{u.name || "Unknown"}</div>
                      <div className="text-sm text-gray-500">{u.email}</div>
                      <div className="text-xs text-gray-400">{u.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <RoleSelect userId={u.id} currentRole={u.role || 'user'} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {u.role === 'banned' ? (
                     <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                       <Ban className="w-3 h-3" /> Banned
                     </span>
                  ) : u.approved ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <AlertTriangle className="w-3 h-3" /> Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {u.role !== 'admin' && (
                    <div className="flex justify-end gap-2">
                       {u.role === 'banned' ? (
                         <form action={async (formData) => {
                           "use server";
                           await toggleBanUser(formData);
                         }}>
                           <input type="hidden" name="id" value={u.id} />
                           <input type="hidden" name="action" value="unban" />
                           <SubmitButton 
                             className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md text-xs"
                             variant="secondary"
                             size="sm"
                           >
                             Unban
                           </SubmitButton>
                         </form>
                       ) : (
                         <form action={async (formData) => {
                           "use server";
                           await toggleBanUser(formData);
                         }}>
                           <input type="hidden" name="id" value={u.id} />
                           <input type="hidden" name="action" value="ban" />
                           <SubmitButton 
                             className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-xs"
                             variant="danger"
                             size="sm"
                           >
                             Ban
                           </SubmitButton>
                         </form>
                       )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
