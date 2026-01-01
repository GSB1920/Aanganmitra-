"use client";

import { useState } from "react";
import { FormField, FieldType } from "@/types/form-schema";
import { X, Plus, Trash2 } from "lucide-react";

interface FieldEditorProps {
  field: FormField;
  onChange: (field: FormField) => void;
  onDelete: () => void;
  isNew?: boolean;
}

export default function FieldEditor({ field, onChange, onDelete, isNew }: FieldEditorProps) {
  const [isOpen, setIsOpen] = useState(isNew || false);

  const updateField = (updates: Partial<FormField>) => {
    onChange({ ...field, ...updates });
  };

  const updateValidation = (key: string, value: any) => {
    onChange({
      ...field,
      validation: {
        ...field.validation,
        [key]: value
      }
    });
  };

  const addOption = () => {
    const options = field.options || [];
    updateField({
      options: [...options, { label: "New Option", value: "new_option" }]
    });
  };

  const updateOption = (index: number, key: 'label' | 'value', val: string) => {
    const options = [...(field.options || [])];
    options[index] = { ...options[index], [key]: val };
    updateField({ options });
  };

  const removeOption = (index: number) => {
    const options = [...(field.options || [])];
    options.splice(index, 1);
    updateField({ options });
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white mb-3 shadow-sm">
      {/* Header / Summary */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer bg-gray-50/50 hover:bg-gray-50 rounded-t-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded uppercase font-bold w-16 text-center">
            {field.type}
          </span>
          <span className="font-medium text-gray-700">{field.label || "Untitled Field"}</span>
          {field.validation?.required && <span className="text-red-500 text-xs">*</span>}
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={(e) => { e.stopPropagation(); onDelete(); }}
             className="p-1 text-gray-400 hover:text-red-500 transition-colors"
           >
             <Trash2 className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Editor Body */}
      {isOpen && (
        <div className="p-4 border-t border-gray-100 grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
              <input 
                type="text" 
                value={field.label} 
                onChange={(e) => updateField({ label: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder="e.g. Property Title"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Key (Internal Name)</label>
              <input 
                type="text" 
                value={field.key} 
                onChange={(e) => updateField({ key: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm font-mono bg-gray-50"
                placeholder="e.g. property_title"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
               <select 
                 value={field.type} 
                 onChange={(e) => updateField({ type: e.target.value as FieldType })}
                 className="w-full px-3 py-2 border rounded-md text-sm"
               >
                 <option value="text">Text Input</option>
                 <option value="number">Number</option>
                 <option value="textarea">Text Area</option>
                 <option value="select">Dropdown (Select)</option>
                 <option value="date">Date</option>
                <option value="boolean">Switch / Toggle</option>
                <option value="map">Location / Map</option>
              </select>
             </div>
             <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Placeholder</label>
                <input 
                  type="text" 
                  value={field.placeholder || ""} 
                  onChange={(e) => updateField({ placeholder: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
             </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 py-2">
             <label className="flex items-center gap-2 text-sm text-gray-700">
               <input 
                 type="checkbox" 
                 checked={field.validation?.required || false}
                 onChange={(e) => updateValidation('required', e.target.checked)}
                 className="rounded border-gray-300 text-primary focus:ring-primary"
               />
               Required Field
             </label>
          </div>

          {/* Type Specific Settings */}
          {field.type === 'select' && (
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                 <label className="text-xs font-bold text-gray-700 uppercase">Options</label>
                 <button 
                   onClick={addOption}
                   className="text-xs flex items-center text-primary hover:underline"
                 >
                   <Plus className="w-3 h-3 mr-1" /> Add Option
                 </button>
              </div>
              <div className="space-y-2">
                {field.options?.map((opt, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input 
                      type="text" 
                      value={opt.label}
                      onChange={(e) => updateOption(idx, 'label', e.target.value)}
                      placeholder="Label"
                      className="flex-1 px-2 py-1 border rounded text-sm"
                    />
                    <input 
                      type="text" 
                      value={opt.value}
                      onChange={(e) => updateOption(idx, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1 px-2 py-1 border rounded text-sm font-mono"
                    />
                    <button 
                      onClick={() => removeOption(idx)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}