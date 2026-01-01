export type FieldType = 'text' | 'number' | 'select' | 'boolean' | 'date' | 'textarea' | 'checkbox' | 'radio' | 'map';

export interface FieldOption {
  label: string;
  value: string | number;
}

export interface FieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string; // regex string
  message?: string; // Error message
}

export interface FieldVisibility {
  roles?: string[]; // ['admin', 'broker', 'internal'] - if undefined, visible to all
  hidden?: boolean;
}

export interface FormField {
  key: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  options?: FieldOption[];
  validation?: FieldValidation;
  visibility?: FieldVisibility;
  editableBy?: string[]; // roles that can edit this field
  defaultValue?: any;
  description?: string;
  className?: string; // Grid col span etc.
}

export interface FormStep {
  stepId: string;
  title: string;
  description?: string;
  fields: FormField[];
}

export interface FormSchema {
  id?: string;
  formKey: string;
  version: string;
  steps: FormStep[];
  status: 'DRAFT' | 'ACTIVE' | 'DEPRECATED';
  created_at?: string;
  updated_at?: string;
}
