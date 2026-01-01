"use client";

import { useState, useEffect } from "react";
import { FormSchema, FormStep } from "@/types/form-schema";
import DynamicField from "./DynamicField";
import SubmitButton from "@/components/ui/submit-button";
import { CheckCircle2, ChevronRight, ChevronLeft, Save } from "lucide-react";
import { createDynamicProperty, updateDynamicProperty } from "@/app/action/properties/dynamic"; // We'll create this next

interface DynamicFormProps {
  schema: FormSchema;
  initialData?: any;
  userRole?: string; // 'admin', 'broker', 'internal'
  propertyId?: string; // If provided, we are in EDIT mode
}

export default function DynamicForm({ schema, initialData = {}, userRole = 'broker', propertyId }: DynamicFormProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<any>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  
  const steps = schema.steps;
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  // Filter fields based on visibility
  const visibleFields = currentStep.fields.filter(field => {
    if (!field.visibility || !field.visibility.roles) return true;
    return field.visibility.roles.includes(userRole);
  });

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
    // Clear error
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    visibleFields.forEach(field => {
      const value = formData[field.key];
      
      // Required check
      if (field.validation?.required && (value === undefined || value === "" || value === null)) {
        newErrors[field.key] = `${field.label} is required`;
        isValid = false;
      }
      
      // Min/Max for numbers
      if (field.type === "number" && value !== undefined && value !== "") {
         if (field.validation?.min !== undefined && Number(value) < field.validation.min) {
           newErrors[field.key] = `Minimum value is ${field.validation.min}`;
           isValid = false;
         }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStepIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setCurrentStepIndex(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (formDataPayload: FormData) => {
    // We don't use the payload directly, we use the state 'formData'
    // But we need to pass it to the server action.
    // Ideally we should construct a FormData object or pass JSON.
    // Server Actions accept FormData or plain arguments.
    
    // Final validation
    if (!validateStep()) return;

    // Construct payload
    const payload = new FormData();
    payload.append("formKey", schema.formKey);
    payload.append("formVersion", schema.version);
    payload.append("data", JSON.stringify(formData));
    
    let result;
    if (propertyId) {
       payload.append("propertyId", propertyId);
       result = await updateDynamicProperty(payload);
    } else {
       result = await createDynamicProperty(payload);
    }
    
    if (result.error) {
      setMessage(result.error);
    } else {
      // Redirect or show success
      window.location.href = "/properties";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
       {/* Header */}
       <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{schema.formKey === 'PROPERTY' ? 'Add New Property' : schema.formKey.replace(/_/g, ' ')}</h1>
            <p className="text-gray-500 text-sm mt-1">
               {currentStep.title} (Step {currentStepIndex + 1} of {steps.length})
            </p>
          </div>
          <div className="bg-blue-100 text-blue-700 text-xs font-mono font-medium px-2 py-1 rounded">
             {schema.version}
          </div>
        </div>

        {/* Stepper */}
        <div className="px-8 py-6 border-b border-gray-100 bg-white">
          <div className="flex justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2 rounded-full" />
            {steps.map((s, idx) => (
              <div key={s.stepId} className="flex flex-col items-center bg-white px-2">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                    idx <= currentStepIndex 
                      ? 'bg-primary border-primary text-white' 
                      : 'bg-white border-gray-300 text-gray-400'
                 }`}>
                   {idx < currentStepIndex ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                 </div>
                 <span className="text-[10px] mt-1 text-gray-500 hidden sm:block max-w-[60px] text-center truncate">{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Fields */}
        <div className="p-8 min-h-[400px]">
           {message && (
             <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
               {message}
             </div>
           )}
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {visibleFields.map((field) => (
               <DynamicField
                 key={field.key}
                 field={field}
                 value={formData[field.key]}
                 onChange={(val) => handleChange(field.key, val)}
                 error={errors[field.key]}
               />
             ))}
           </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-between">
           <button
             type="button"
             onClick={handleBack}
             disabled={currentStepIndex === 0}
             className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
           >
             <ChevronLeft className="w-4 h-4 mr-1" /> Back
           </button>

           {isLastStep ? (
             <form action={handleSubmit}>
                <SubmitButton className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center">
                   <Save className="w-4 h-4 mr-2" /> {propertyId ? 'Update Property' : 'Submit Property'}
                </SubmitButton>
             </form>
           ) : (
             <button
               type="button"
               onClick={handleNext}
               className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center"
             >
               Next <ChevronRight className="w-4 h-4 ml-1" />
             </button>
           )}
        </div>
    </div>
  );
}
