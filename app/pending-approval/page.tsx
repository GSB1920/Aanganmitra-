import { supabaseServer } from "@/lib/supabase/server";
import Link from "next/link";
import LoadingButton from "@/components/ui/loading-button";
import { Clock, Home, ArrowRight, ShieldCheck } from "lucide-react";

export default async function PendingApprovalPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Account Pending Approval
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Thank you for registering with Aangan Mitra
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-100 sm:rounded-xl sm:px-10 border border-gray-100">
          <div className="space-y-6">
            <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ShieldCheck className="h-5 w-5 text-blue-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Review in progress</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Your account has been created and is currently awaiting admin approval. This process helps us maintain a secure community.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500 text-center leading-relaxed">
              We'll notify you via email once your account is approved. You will then be able to access the dashboard and manage your properties.
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <Link 
                href="/" 
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Return to Home
              </Link>
              
              {!user && (
                <LoadingButton href="/login" variant="primary" className="w-full justify-center">
                  Login to Account <ArrowRight className="w-4 h-4 ml-2" />
                </LoadingButton>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Aangan Mitra. All rights reserved.
        </div>
      </div>
    </div>
  );
}
