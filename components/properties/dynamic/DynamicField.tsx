import { FormField } from "@/types/form-schema";
import MapField from "./fields/MapField";

// Standard HTML components used instead of shadcn/ui for portability in this demo

interface DynamicFieldProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
}

export default function DynamicField({ field, value, onChange, error, disabled }: DynamicFieldProps) {
  const baseInputClass = "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className={`space-y-2 ${field.className || ""}`}>
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {field.label}
        {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {field.type === "text" || field.type === "number" || field.type === "date" ? (
        <input
          type={field.type}
          placeholder={field.placeholder}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClass}
          disabled={disabled}
        />
      ) : field.type === "textarea" ? (
        <textarea
          placeholder={field.placeholder}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInputClass} min-h-[80px]`}
          disabled={disabled}
        />
      ) : field.type === "select" ? (
        <div className="relative">
           <select
             value={value || ""}
             onChange={(e) => onChange(e.target.value)}
             className={baseInputClass}
             disabled={disabled}
           >
             <option value="" disabled>Select {field.label}</option>
             {field.options?.map((opt) => (
               <option key={opt.value} value={opt.value}>
                 {opt.label}
               </option>
             ))}
           </select>
        </div>
      ) : field.type === "boolean" ? (
        <div className="flex items-center gap-2">
           <input 
             type="checkbox"
             checked={value === true}
             onChange={(e) => onChange(e.target.checked)}
             className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
             disabled={disabled}
           />
           <span className="text-sm text-gray-600">Yes, {field.label}</span>
        </div>
      ) : field.type === "map" ? (
        <MapField 
           value={value} 
           onChange={onChange} 
           disabled={disabled} 
        />
      ) : null}
      
      {field.description && (
        <p className="text-[0.8rem] text-gray-500">{field.description}</p>
      )}
      
      {error && (
        <p className="text-[0.8rem] font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}
