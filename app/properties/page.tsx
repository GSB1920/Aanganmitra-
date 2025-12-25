import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import PropertiesListClient from "./list-client";
import LoadingButton from "@/components/ui/loading-button";
import { Plus, Building2, Wallet, Home, BarChart3, TrendingUp } from "lucide-react";

export default async function PropertiesListPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center bg-gray-50/50">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Login Required</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
            Please sign in to access your property dashboard and manage your real estate portfolio.
            </p>
            <Link 
            href="/login" 
            className="block w-full py-3 px-4 bg-primary text-white rounded-xl font-medium shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 transition-all duration-200"
            >
            Sign In to Continue
            </Link>
        </div>
      </div>
    );
  }

  // Fetch stats
  const { count } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user.id);

  // Calculate total value
  const { data: properties } = await supabase
    .from("properties")
    .select("asking_price")
    .eq("owner_id", user.id);

  const totalValue = properties?.reduce((sum, p) => sum + (p.asking_price || 0), 0) || 0;
  
  const formatCompactNumber = new Intl.NumberFormat("en-IN", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  });

  const avgValue = count ? totalValue / count : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-2 text-lg">Manage your real estate portfolio</p>
        </div>
        <LoadingButton href="/properties/add" variant="primary" className="shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
          <Plus className="w-5 h-5 mr-2" />
          Add Property
        </LoadingButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-start justify-between group hover:border-blue-200 transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Properties</p>
            <h3 className="text-3xl font-bold text-gray-900">{count || 0}</h3>
            <div className="flex items-center mt-2 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>Active Portfolio</span>
            </div>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
            <Home className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-start justify-between group hover:border-green-200 transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Portfolio Value</p>
            <h3 className="text-3xl font-bold text-gray-900">{formatCompactNumber.format(totalValue)}</h3>
             <p className="text-xs text-gray-400 mt-2">Estimated market value</p>
          </div>
          <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
            <Wallet className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-start justify-between group hover:border-purple-200 transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Average Value</p>
            <h3 className="text-3xl font-bold text-gray-900">
              {formatCompactNumber.format(avgValue)}
            </h3>
            <p className="text-xs text-gray-400 mt-2">Per property</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
           <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
             <Building2 className="w-5 h-5 text-gray-400" />
             Property Listings
           </h2>
           <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
             {count || 0} Total
           </span>
        </div>
        <div className="p-6">
          <PropertiesListClient />
        </div>
      </div>
    </div>
  );
}
