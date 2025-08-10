// import { useState, useEffect, useCallback } from 'react';
// import { type FieldConfig } from '../types/FieldConfig';

// // --- Validation Logic ---
// const validateField = (field: FieldConfig, value: any) => {
//     const rules = field.validations;
//     if (!rules) return '';

//     if (rules.required && !value) return `${field.label} is required.`;
//     if (rules.minLength && value.length < rules.minLength) return `Must be at least ${rules.minLength} characters.`;
//     if (rules.maxLength && value.length > rules.maxLength) return `Must be no more than ${rules.maxLength} characters.`;
//     if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email address.';
//     if (rules.passwordRule && !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value)) {
//         return 'Password must be 8+ characters with at least one letter and one number.';
//     }
//     return '';
// };

// // --- Derived Field Calculation ---
// const calculateDerivedField = (fieldId: string, fields: FieldConfig[], formState: any) => {
//     const field = fields.find(f => f.id === fieldId);
//     if (!field?.derived) return formState[fieldId];

//     // Example: Age from Date of Birth
//     // NOTE: This is a simple, specific implementation. A real-world app
//     // would need a more robust formula engine.
//     if (field.derived.formula === 'ageFromDob' && field.derived.parents.length === 1) {
//         const dob = formState[field.derived.parents[0]];
//         if (!dob) return '';
//         const birthDate = new Date(dob);
//         const today = new Date();
//         let age = today.getFullYear() - birthDate.getFullYear();
//         const m = today.getMonth() - birthDate.getMonth();
//         if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
//             age--;
//         }
//         return age >= 0 ? age.toString() : '';
//     }

//     return 'Invalid formula';
// };

// export const useForm = (fields: FieldConfig[]) => {
//     const [formState, setFormState] = useState<any>({});
//     const [errors, setErrors] = useState<any>({});
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);

//     // Initialize form state with default values
//     useEffect(() => {
//         const initialState = fields.reduce((acc, field) => {
//             acc[field.id] = field.defaultValue ?? '';
//             return acc;
//         }, {} as any);
//         setFormState(initialState);
//         setErrors({});
//         setIsSubmitSuccessful(false);
//     }, [fields]);

//     // Handle derived fields and validation
//     useEffect(() => {
//         const newState = { ...formState };
//         let stateChanged = false;

//         fields.forEach(field => {
//             if (field.derived) {
//                 const newValue = calculateDerivedField(field.id, fields, formState);
//                 if (newState[field.id] !== newValue) {
//                     newState[field.id] = newValue;
//                     stateChanged = true;
//                 }
//             }
//         });

//         if (stateChanged) {
//             setFormState(newState);
//         }
//     }, [formState, fields]);


//     const handleInputChange = useCallback((id: string, value: any) => {
//         setIsSubmitSuccessful(false); // Reset success state on new input
//         setFormState((prev: any) => ({ ...prev, [id]: value }));

//         // Validate on change
//         const field = fields.find(f => f.id === id);
//         if (field) {
//             const error = validateField(field, value);
//             setErrors((prev: any) => ({ ...prev, [id]: error }));
//         }
//     }, [fields]);

//     const handleSubmit = (onSuccess: () => void) => {
//         setIsSubmitting(true);
//         setIsSubmitSuccessful(false);

//         const validationErrors = fields.reduce((acc, field) => {
//             const error = validateField(field, formState[field.id]);
//             if (error) acc[field.id] = error;
//             return acc;
//         }, {} as any);

//         setErrors(validationErrors);

//         if (Object.keys(validationErrors).length === 0) {
//             onSuccess();
//             setIsSubmitSuccessful(true);
//         }

//         setIsSubmitting(false);
//     };

//     return { formState, errors, isSubmitting, isSubmitSuccessful, handleInputChange, handleSubmit };
// };


import { useState, useEffect, useCallback } from 'react';
import { type FieldConfig } from '../types/FieldConfig';

// --- Validation Logic ---
const validateField = (field: FieldConfig, value: any) => {
    const rules = field.validations;
    if (!rules) return '';

    if (rules.required && !value) return `${field.label} is required.`;
    if (rules.minLength && value.length < rules.minLength) return `Must be at least ${rules.minLength} characters.`;
    if (rules.maxLength && value.length > rules.maxLength) return `Must be no more than ${rules.maxLength} characters.`;
    if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email address.';
    if (rules.passwordRule && !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value)) {
        return 'Password must be 8+ characters with at least one letter and one number.';
    }
    return '';
};

// --- Derived Field Calculation ---
const calculateDerivedField = (field: FieldConfig, formState: any) => {
    if (!field.derived) return '';

    const { formula, parents } = field.derived;
    const parentValues = parents.map(pId => formState[pId] || '');

    switch (formula) {
        case 'ageFromDob': {
            if (parentValues.length !== 1 || !parentValues[0]) return '';
            const birthDate = new Date(parentValues[0]);
            // Prevents invalid date calculations
            if (isNaN(birthDate.getTime())) return '';

            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age >= 0 ? age.toString() : '';
        }

        case 'concatenate': {
            // Joins parent fields with a space, e.g., "First Name" + "Last Name"
            return parentValues.join(' ').trim();
        }

        case 'sum': {
            // Adds the values of all parent fields
            const total = parentValues.reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
            return total.toString();
        }

        default:
            return 'Invalid Formula';
    }
};

export const useForm = (fields: FieldConfig[]) => {
    const [formState, setFormState] = useState<any>({});
    const [errors, setErrors] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);

    useEffect(() => {
        const initialState = fields.reduce((acc, field) => {
            acc[field.id] = field.defaultValue ?? '';
            if (field.derived) {
                // Pre-calculate based on default parent values
                acc[field.id] = calculateDerivedField(field, acc);
            }
            return acc;
        }, {} as any);
        setFormState(initialState);
        setErrors({});
        setIsSubmitSuccessful(false);
    }, [fields]);


    const handleInputChange = useCallback((id: string, value: any) => {
        setIsSubmitSuccessful(false);
        setFormState((currentState: any) => {
            const updatedState = { ...currentState, [id]: value };
            fields.forEach(field => {
                if (field.derived && field.derived.parents.includes(id)) {
                    updatedState[field.id] = calculateDerivedField(field, updatedState);
                }
            });
            return updatedState;
        });

        const field = fields.find(f => f.id === id);
        if (field) {
            const error = validateField(field, value);
            setErrors((prev: any) => ({ ...prev, [id]: error }));
        }
    }, [fields]);

    const handleSubmit = (onSuccess: () => void) => {
        setIsSubmitting(true);
        setIsSubmitSuccessful(false);

        const validationErrors = fields.reduce((acc, field) => {
            const error = validateField(field, formState[field.id]);
            if (error) acc[field.id] = error;
            return acc;
        }, {} as any);

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            onSuccess();
            setIsSubmitSuccessful(true);
        }

        setIsSubmitting(false);
    };

    return { formState, errors, isSubmitting, isSubmitSuccessful, handleInputChange, handleSubmit };
};
