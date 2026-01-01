"use client";

import { useFormState } from "react-dom";
import SubmitButton from "@/components/ui/submit-button";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { seedInitialSchema } from "@/app/action/schema";

const initialState = {
  message: "",
  error: "",
  success: false
};

// Wrapper for the server action to match useFormState signature
// Server action returns { message?, error?, success? }
// useFormState expects (prevState, formData) => newState
async function seedAction(prevState: any, formData: FormData) {
  try {
    const result = await seedInitialSchema();
    return {
       message: result.message || "",
       error: result.error || "",
       success: !!result.success || !!result.message
    };
  } catch (e: any) {
    return {
       message: "",
       error: e.message || "Failed to seed schema",
       success: false
    };
  }
}

export default function SchemaSeedForm() {
  const [state, formAction] = useFormState(seedAction, initialState);

  return (
    <div className="flex items-center justify-between">
      <div>
         <h3 className="text-sm font-medium text-gray-900">Initialize Property Schema</h3>
         <p className="text-sm text-gray-500 mt-1 max-w-md">
           Seeds the database with the default v1 property form schema. Safe to run multiple times (checks for existence).
         </p>
         
         {state.success && (
            <div className="mt-2 text-sm text-green-600 flex items-center">
               <CheckCircle2 className="w-4 h-4 mr-1" />
               {state.message || "Schema seeded successfully"}
            </div>
         )}
         
         {state.error && (
            <div className="mt-2 text-sm text-red-600 flex items-center">
               <AlertCircle className="w-4 h-4 mr-1" />
               {state.error}
            </div>
         )}
      </div>
      
      <form action={formAction}>
         <SubmitButton className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90">
           <RefreshCw className="w-4 h-4 mr-2" />
           Seed Schema
         </SubmitButton>
      </form>
    </div>
  );
}
