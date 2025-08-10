import React from 'react';
import {
    TextField,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Checkbox,
    MenuItem,
    Select,
    InputLabel,
    FormHelperText,
} from '@mui/material';
import { type FieldConfig } from '../types/FieldConfig';

interface FormFieldProps {
    field: FieldConfig;
    value: any;
    error?: string;
    onChange: (id: string, value: any) => void;
}

export const FormField: React.FC<FormFieldProps> = ({ field, value, error, onChange }) => {
    const commonProps = {
        label: field.label,
        error: !!error,
        helperText: error,
        required: field.validations?.required,
    };

    // Derived fields should be read-only
    if (field.derived) {
        return (
            <TextField
                fullWidth
                variant="filled"
                value={value || ''}
                label={`${field.label} (Derived)`}
                InputProps={{
                    readOnly: true,
                }}
            />
        );
    }

    switch (field.type) {
        case 'text':
        case 'number':
            return (
                <TextField
                    {...commonProps}
                    fullWidth
                    type={field.type}
                    value={value || ''}
                    onChange={(e) => onChange(field.id, e.target.value)}
                />
            );
        case 'textarea':
            return (
                <TextField
                    {...commonProps}
                    fullWidth
                    multiline
                    rows={4}
                    value={value || ''}
                    onChange={(e) => onChange(field.id, e.target.value)}
                />
            );
        case 'date':
            return (
                <TextField
                    {...commonProps}
                    fullWidth
                    type="date"
                    value={value || ''}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
            );
        case 'select':
            return (
                <FormControl fullWidth error={!!error}>
                    <InputLabel>{field.label}</InputLabel>
                    <Select
                        value={value || ''}
                        label={field.label}
                        onChange={(e) => onChange(field.id, e.target.value)}
                    >
                        {(field.options || []).map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                    </Select>
                    {error && <FormHelperText>{error}</FormHelperText>}
                </FormControl>
            );
        case 'radio':
            return (
                <FormControl component="fieldset" error={!!error}>
                    <FormLabel component="legend">{field.label}</FormLabel>
                    <RadioGroup value={value || ''} onChange={(e) => onChange(field.id, e.target.value)}>
                        {(field.options || []).map((option) => (
                            <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                        ))}
                    </RadioGroup>
                    {error && <FormHelperText>{error}</FormHelperText>}
                </FormControl>
            );
        case 'checkbox':
            return (
                <FormControl error={!!error}>
                    <FormControlLabel
                        control={<Checkbox checked={!!value} onChange={(e) => onChange(field.id, e.target.checked)} />}
                        label={field.label}
                    />
                    {error && <FormHelperText>{error}</FormHelperText>}
                </FormControl>
            );
        default:
            return null;
    }
};