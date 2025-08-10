import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    List,
    ListItemButton,
    ListItemText,
    Divider,
} from '@mui/material';
import { getForms } from '../utils/localStorage';

// Define the structure of a saved form for TypeScript
interface SavedForm {
    id: string;
    name: string;
    dateCreated: string;
    fields: any[];
}

export default function MyFormsPage() {
    const [forms, setForms] = useState<SavedForm[]>([]);
    const navigate = useNavigate();

    // Load forms from localStorage when the component mounts
    useEffect(() => {
        setForms(getForms());
    }, []);

    const handleFormClick = (formId: string) => {
        // Navigate to the preview page with the specific form ID
        console.log('Attempting to navigate to preview with form ID:', formId);
        navigate(`/preview/${formId}`);
    };

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 3, my: 3 }}>
                <Typography variant="h4" gutterBottom>
                    My Saved Forms
                </Typography>
                <Divider />
                {forms.length > 0 ? (
                    <List>
                        {forms.map((form) => (
                            <ListItemButton key={form.id} onClick={() => handleFormClick(form.id)}>
                                <ListItemText
                                    primary={form.name}
                                    secondary={`Created on: ${new Date(form.dateCreated).toLocaleString()}`}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                ) : (
                    <Typography sx={{ mt: 3, color: 'text.secondary' }}>
                        You have not saved any forms yet.
                    </Typography>
                )}
            </Paper>
        </Container>
    );
}