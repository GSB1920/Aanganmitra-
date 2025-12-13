import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import PropertiesListClient from "./list-client";
import LoadingButton from "@/components/ui/loading-button";

export default async function PropertiesListPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return (
      <div className="p-6">
        <p className="text-gray-700">You need to log in to view your properties.</p>
        <Link href="/login" className="text-blue-600 underline">Login</Link>
      </div>
    );
  }

  const error = null;

  const formatINR = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  // Safely extract debug parameter
  const debugMode = searchParams?.debug === "1" || searchParams?.debug?.[0] === "1";

  return (
    <div className="p-6 px-40">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Properties</h1>
        <LoadingButton href="/properties/add" variant="primary">+ Add Property</LoadingButton>
      </div>

      <PropertiesListClient />
    </div>
  );
}
