import { supabaseServer } from "@/lib/supabase/server";
import { getFormSchema } from "@/app/action/schema";
import SchemaBuilder from "@/components/settings/builder/SchemaBuilder";
import { Shield, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function SchemaBuilderPage({
  searchParams
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  // Get form key from URL, default to PROPERTY_INTERNAL if missing
  const formKey = (searchParams?.key as string) || "PROPERTY_INTERNAL";

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <Shield className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h2>
        <Link href="/login" className="text-primary hover:underline">Sign In</Link>
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
        <p className="text-gray-600">Only admins can access settings.</p>
      </div>
    );
  }

  // Fetch the latest schema to start editing
  const { schema, error } = await getFormSchema(formKey);

  if (error || !schema) {
     return (
        <div className="p-8 text-center">
           <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
           <h2 className="text-xl font-bold text-gray-900">Error Loading Schema</h2>
           <p className="text-gray-500 mt-2">{error || "No active schema found. Please seed the database first."}</p>
           <Link href="/settings" className="mt-4 inline-block text-primary hover:underline">Back to Settings</Link>
        </div>
     );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <SchemaBuilder initialSchema={schema} />
    </div>
  );
}