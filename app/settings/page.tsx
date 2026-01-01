import { supabaseServer } from "@/lib/supabase/server";
import { Shield, Settings as SettingsIcon, Database, CheckCircle2, PenTool } from "lucide-react";
import Link from "next/link";
import SchemaSeedForm from "@/components/settings/SchemaSeedForm";

export default async function SettingsPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

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

  // Get current versions
  const { data: latestInternal } = await supabase
    .from("form_schemas")
    .select("version")
    .eq("form_key", "PROPERTY_INTERNAL")
    .eq("status", "ACTIVE")
    .order("version", { ascending: false })
    .limit(1)
    .single();

  const { data: latestBroker } = await supabase
    .from("form_schemas")
    .select("version")
    .eq("form_key", "PROPERTY_BROKER")
    .eq("status", "ACTIVE")
    .order("version", { ascending: false })
    .limit(1)
    .single();

  const internalVersion = latestInternal?.version || "Not Configured";
  const brokerVersion = latestBroker?.version || "Not Configured";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary/10 p-2 rounded-lg">
          <SettingsIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-sm text-gray-500">Manage global configurations and schemas</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Internal User Schema Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Internal Property Form</h2>
              </div>
              <p className="text-sm text-gray-500 mt-1">Form used by Admins and Internal Staff</p>
            </div>
            <Link 
              href="/settings/schema-builder?key=PROPERTY_INTERNAL"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800"
            >
              <PenTool className="w-4 h-4 mr-2" />
              Edit Internal Form
            </Link>
          </div>
          <div className="px-6 py-4">
             <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Active Version: <strong>{internalVersion}</strong></span>
             </div>
          </div>
        </div>

        {/* Broker User Schema Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Broker Property Form</h2>
              </div>
              <p className="text-sm text-gray-500 mt-1">Form used by External Brokers</p>
            </div>
            <Link 
              href="/settings/schema-builder?key=PROPERTY_BROKER"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800"
            >
              <PenTool className="w-4 h-4 mr-2" />
              Edit Broker Form
            </Link>
          </div>
          <div className="px-6 py-4">
             <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Active Version: <strong>{brokerVersion}</strong></span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
