export const saveFormSchema = (formName: string, fields: unknown[]) => {

    const forms = JSON.parse(localStorage.getItem('forms') || '[]');
    forms.push({
        id: Date.now().toString(),
        name: formName,
        dateCreated: new Date().toISOString(),
        fields,
    });
    localStorage.setItem('forms', JSON.stringify(forms));

};

export const getForms = () => {
    return JSON.parse(localStorage.getItem('forms') || '[]');
}

