import { supabaseServer } from "@/lib/supabase/server";
import Link from "next/link";
import LoadingButton from "@/components/ui/loading-button";

export default async function PendingApprovalPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="bg-white border rounded-md shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Account Pending Approval</h1>
        <p className="text-gray-700">
          Your account has been created and is awaiting admin approval. You will be able to access the app once approved.
        </p>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-blue-600 underline">Home</Link>
          {!user && <LoadingButton href="/login" variant="primary">Login</LoadingButton>}
        </div>
      </div>
    </div>
  );
}
