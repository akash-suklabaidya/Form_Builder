export type FieldType = | 'text'
    | 'number'
    | 'textarea'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'date';

export interface ValidationRules {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    email?: boolean;
    passwordRule?: boolean;
}

export interface DerivedField {
    parents?: string[];
    formula?: string;
}


export interface FieldConfig {
    id: string;
    type: FieldType;
    label: string;
    defaultValue?: string | number | boolean;
    options?: string[];
    validations?: ValidationRules;
    derived?: DerivedField;
}