import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Container, Paper, Typography, Alert, Stack } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getForms } from '../utils/localStorage';
import { useForm } from '../utils/useForm';
import { FormField } from '../components/FormField';
import { type FieldConfig } from '../types/FieldConfig';

interface FormSchema {
    id: string;
    name: string;
    fields: FieldConfig[];
}

export default function FormPreview() {
    const { formId } = useParams<{ formId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const [formSchema, setFormSchema] = useState<FormSchema | null>(null);
    const [isPreviewOfUnsaved, setIsPreviewOfUnsaved] = useState(false);

    useEffect(() => {
        if (location.state?.formSchema) {
            setFormSchema(location.state.formSchema as FormSchema);
            setIsPreviewOfUnsaved(true);
        }
        else if (formId) {
            const forms = getForms();
            const selectedForm = forms.find((f: any) => f.id === formId);
            setFormSchema(selectedForm);
            setIsPreviewOfUnsaved(false);
        } else {
            setFormSchema(null);
        }
    }, [formId, location.state]);

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
                    <Typography sx={{ my: 2 }}>
                        Please select a form from the 'My Forms' page or create a new one.
                    </Typography>
                    <Button component={Link} to="/myforms" variant="contained">
                        Go to My Forms
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 3, my: 3 }}>
                <form onSubmit={onFormSubmit} noValidate>
                    <Typography variant="h4" gutterBottom>
                        {formSchema.name}
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={3}>
                        {formSchema.fields.map((field: FieldConfig) => (
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

                        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                            {isPreviewOfUnsaved && (
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => navigate(-1)}
                                    startIcon={<ArrowBackIcon />}
                                >
                                    Back to Editor
                                </Button>
                            )}

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </Button>
                        </Stack>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
}