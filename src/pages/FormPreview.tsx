// import React, { useState } from 'react';
// import {
//     Box,
//     Button,
//     Container,
//     FormControl,
//     InputLabel,
//     MenuItem,
//     Paper,
//     Select,
//     Typography,
//     Alert
// } from '@mui/material';
// import { getForms } from '../utils/localStorage';
// import { useForm } from '../utils/useForm'
// import { FormField } from '../components/FormField';

// export default function FormPreview() {
//     const [forms] = useState(() => getForms());
//     const [selectedFormId, setSelectedFormId] = useState<string>('');

//     const selectedForm = forms.find((f: any) => f.id === selectedFormId);

//     const {
//         formState,
//         errors,
//         isSubmitting,
//         isSubmitSuccessful,
//         handleInputChange,
//         handleSubmit,
//     } = useForm(selectedForm?.fields || []);

//     const onFormSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         handleSubmit(() => {
//             // This callback runs on successful submission.
//             // You can add logic here, e.g., sending data to a server.
//             console.log('Form Submitted Successfully:', formState);
//         });
//     };

//     return (
//         <Container maxWidth="md">
//             <Paper sx={{ p: 3, my: 3 }}>
//                 <Typography variant="h4" gutterBottom>
//                     Form Preview
//                 </Typography>

//                 <FormControl fullWidth sx={{ mb: 4 }}>
//                     <InputLabel id="form-select-label">Select a Form to Preview</InputLabel>
//                     <Select
//                         labelId="form-select-label"
//                         value={selectedFormId}
//                         label="Select a Form to Preview"
//                         onChange={(e) => setSelectedFormId(e.target.value)}
//                     >
//                         {forms.map((form: any) => (
//                             <MenuItem key={form.id} value={form.id}>
//                                 {form.name} (Created: {new Date(form.dateCreated).toLocaleDateString()})
//                             </MenuItem>
//                         ))}
//                     </Select>
//                 </FormControl>

//                 {selectedForm && (
//                     <form onSubmit={onFormSubmit} noValidate>
//                         <Typography variant="h5" gutterBottom>{selectedForm.name}</Typography>
//                         <Box display="flex" flexDirection="column" gap={3}>
//                             {selectedForm.fields.map((field: any) => (
//                                 <FormField
//                                     key={field.id}
//                                     field={field}
//                                     value={formState[field.id]}
//                                     error={errors[field.id]}
//                                     onChange={handleInputChange}
//                                 />
//                             ))}

//                             {isSubmitSuccessful && (
//                                 <Alert severity="success">Form submitted successfully!</Alert>
//                             )}

//                             <Button
//                                 type="submit"
//                                 variant="contained"
//                                 color="primary"
//                                 fullWidth
//                                 disabled={isSubmitting}
//                                 sx={{ mt: 2 }}
//                             >
//                                 {isSubmitting ? 'Submitting...' : 'Submit'}
//                             </Button>
//                         </Box>
//                     </form>
//                 )}
//             </Paper>
//         </Container>
//     );
// }


// src/pages/FormPreview.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // <-- Import useParams and Link
import {
    Box,
    Button,
    Container,
    Paper,
    Typography,
    Alert
} from '@mui/material';
import { getForms } from '../utils/localStorage';
import { useForm } from '../utils/useForm';
import { FormField } from '../components/FormField';

export default function FormPreview() {
    console.log('FormPreview component is mounting...'); 
    const { formId } = useParams<{ formId: string }>(); // <-- Get formId from URL
    const [formSchema, setFormSchema] = useState<any>(null);

    useEffect(() => {
        if (formId) {
            const forms = getForms();
            const selectedForm = forms.find((f: any) => f.id === formId);
            setFormSchema(selectedForm);
        }
    }, [formId]);

    const {
        formState,
        errors,
        isSubmitting,
        isSubmitSuccessful,
        handleInputChange,
        handleSubmit,
    } = useForm(formSchema?.fields || []);

    const onFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit(() => {
            console.log('Form Submitted Successfully:', formState);
        });
    };

    if (!formSchema) {
        return (
            <Container maxWidth="md">
                <Paper sx={{ p: 3, my: 3, textAlign: 'center' }}>
                    <Typography variant="h5">Form Not Found</Typography>
                    <Typography sx={{ my: 2 }}>Please select a form from the 'My Forms' page.</Typography>
                    <Button component={Link} to="/myforms" variant="contained">
                        Go to My Forms
                    </Button>
                </Paper>
            </Container>
        )
    }

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 3, my: 3 }}>
                <form onSubmit={onFormSubmit} noValidate>
                    <Typography variant="h4" gutterBottom>{formSchema.name}</Typography>
                    <Box display="flex" flexDirection="column" gap={3}>
                        {formSchema.fields.map((field: any) => (
                            <FormField
                                key={field.id}
                                field={field}
                                value={formState[field.id]}
                                error={errors[field.id]}
                                onChange={handleInputChange}
                            />
                        ))}

                        {isSubmitSuccessful && (
                            <Alert severity="success">Form submitted successfully!</Alert>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={isSubmitting}
                            sx={{ mt: 2 }}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
}