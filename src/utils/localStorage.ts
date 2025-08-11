import { nanoid } from 'nanoid';
import { type FieldConfig } from '../types/FieldConfig';

export const saveFormSchema = (formName: string, fields: FieldConfig[]) => {
    const forms = JSON.parse(localStorage.getItem('forms') || '[]');

    forms.push({
        id: nanoid(),
        name: formName,
        dateCreated: new Date().toISOString(),
        fields,
    });

    localStorage.setItem('forms', JSON.stringify(forms));
};

export const getForms = () => {
    return JSON.parse(localStorage.getItem('forms') || '[]');
};