// src/pages/CreateFormPage.tsx
import { Box, Button, Container, Typography, Paper } from '@mui/material';

export default function CreateFormPage() {
    const handleAddField = () => {
        // We will add logic here soon
        console.log("Add new field clicked!");
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4, mb: 4 }}>
                Form Builder
            </Typography>
            <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
                {/* Form fields will be rendered here */}
                <Typography>Your form is currently empty.</Typography>
            </Paper>
            <Box>
                <Button variant="contained" onClick={handleAddField}>
                    Add Text Field
                </Button>
            </Box>
        </Container>
    );
}