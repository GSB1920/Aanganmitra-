import { getFormSchema } from "@/app/action/schema";
import DynamicForm from "@/components/properties/dynamic/DynamicForm";
import { AlertCircle } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";

export default async function AddDynamicPropertyPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>Please login</div>;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role || "user";
  
  // Determine schema key based on role
  // Admins also use Internal form by default
  const schemaKey = (role === "broker" || role === "user") ? "PROPERTY_BROKER" : "PROPERTY_INTERNAL";

  const { schema, error } = await getFormSchema(schemaKey);

  if (error || !schema) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl text-center">
        <div className="bg-red-50 inline-flex p-3 rounded-full mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Failed to load form</h1>
        <p className="text-gray-500 mt-2">{error || "Schema not found"}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <DynamicForm schema={schema} userRole={role} />
    </div>
  );
}
