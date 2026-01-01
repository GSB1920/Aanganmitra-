"use client";

import { useState } from "react";
import { FormSchema, FormStep, FormField } from "@/types/form-schema";
import FieldEditor from "./FieldEditor";
import { Plus, Save, Layers, ArrowLeft } from "lucide-react";
import { saveSchema } from "@/app/action/schema/save";
import SubmitButton from "@/components/ui/submit-button";
import Link from "next/link";

interface SchemaBuilderProps {
  initialSchema: FormSchema;
}

export default function SchemaBuilder({ initialSchema }: SchemaBuilderProps) {
  const [schema, setSchema] = useState<FormSchema>(initialSchema);
  const [activeStepId, setActiveStepId] = useState<string>(initialSchema.steps[0]?.stepId || "");
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const activeStepIndex = schema.steps.findIndex(s => s.stepId === activeStepId);
  const activeStep = schema.steps[activeStepIndex];

  const updateStep = (index: number, updates: Partial<FormStep>) => {
    const newSteps = [...schema.steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    setSchema({ ...schema, steps: newSteps });
  };

  const addStep = () => {
    const newStepId = `step_${Date.now()}`;
    const newStep: FormStep = {
      stepId: newStepId,
      title: "New Step",
      description: "",
      fields: []
    };
    setSchema({ ...schema, steps: [...schema.steps, newStep] });
    setActiveStepId(newStepId);
  };

  const addField = () => {
    if (activeStepIndex === -1) return;
    const newField: FormField = {
      key: `field_${Date.now()}`,
      type: "text",
      label: "New Field",
      validation: { required: false }
    };
    const newFields = [...activeStep.fields, newField];
    updateStep(activeStepIndex, { fields: newFields });
  };

  const updateField = (fieldIndex: number, updatedField: FormField) => {
    const newFields = [...activeStep.fields];
    newFields[fieldIndex] = updatedField;
    updateStep(activeStepIndex, { fields: newFields });
  };

  const deleteField = (fieldIndex: number) => {
    const newFields = [...activeStep.fields];
    newFields.splice(fieldIndex, 1);
    updateStep(activeStepIndex, { fields: newFields });
  };

  async function handleSave() {
    setMessage(null);
    const result = await saveSchema(schema);
    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: `Schema saved successfully as ${result.version}` });
      // Update local version display
      if (result.version) {
        setSchema(prev => ({ ...prev, version: result.version! }));
      }
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200 mb-6">
        <div className="flex items-center gap-4">
           <Link href="/settings" className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
             <ArrowLeft className="w-5 h-5" />
           </Link>
           <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                 Form Builder: {schema.formKey}
                 <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                    {schema.version}
                 </span>
              </h2>
              <p className="text-sm text-gray-500">Design your property submission form</p>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
           <form action={handleSave}>
              <SubmitButton className="bg-primary text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-primary/90">
                <Save className="w-4 h-4 mr-2" />
                Save New Version
              </SubmitButton>
           </form>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
           {message.text}
        </div>
      )}

      <div className="flex flex-1 gap-6 overflow-hidden">
         {/* Steps Sidebar */}
         <div className="w-64 flex flex-col border-r border-gray-200 pr-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Steps
               </h3>
               <button onClick={addStep} className="p-1 hover:bg-gray-100 rounded text-primary">
                  <Plus className="w-4 h-4" />
               </button>
            </div>
            
            <div className="space-y-2">
               {schema.steps.map((step, idx) => (
                 <div 
                   key={step.stepId}
                   onClick={() => setActiveStepId(step.stepId)}
                   className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                     activeStepId === step.stepId 
                       ? 'bg-blue-50 border-blue-200 shadow-sm' 
                       : 'bg-white border-gray-200 hover:bg-gray-50'
                   }`}
                 >
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {idx + 1}. {step.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {step.fields.length} fields
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Main Editor Area */}
         <div className="flex-1 overflow-y-auto pr-2">
            {activeStep ? (
               <div className="max-w-3xl mx-auto">
                  {/* Step Config */}
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                     <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Step Configuration</h3>
                     <div className="grid gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Step Title</label>
                           <input 
                             type="text" 
                             value={activeStep.title} 
                             onChange={(e) => updateStep(activeStepIndex, { title: e.target.value })}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                           <input 
                             type="text" 
                             value={activeStep.description || ""} 
                             onChange={(e) => updateStep(activeStepIndex, { description: e.target.value })}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                           />
                        </div>
                     </div>
                  </div>

                  {/* Fields List */}
                  <div className="mb-6 flex items-center justify-between">
                     <h3 className="text-lg font-bold text-gray-900">Form Fields</h3>
                     <button 
                       onClick={addField}
                       className="flex items-center px-3 py-1.5 bg-gray-900 text-white rounded-md text-sm hover:bg-gray-800"
                     >
                       <Plus className="w-4 h-4 mr-2" /> Add Field
                     </button>
                  </div>

                  <div className="space-y-4 pb-20">
                     {activeStep.fields.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                           <p className="text-gray-500">No fields in this step yet.</p>
                           <button onClick={addField} className="text-primary hover:underline text-sm mt-2">Add your first field</button>
                        </div>
                     )}
                     
                     {activeStep.fields.map((field, idx) => (
                        <FieldEditor 
                           key={idx}
                           field={field}
                           onChange={(updated) => updateField(idx, updated)}
                           onDelete={() => deleteField(idx)}
                           isNew={field.label === "New Field"}
                        />
                     ))}
                  </div>
               </div>
            ) : (
               <div className="flex items-center justify-center h-full text-gray-400">
                  Select a step to start editing
               </div>
            )}
         </div>
      </div>
    </div>
  );
}