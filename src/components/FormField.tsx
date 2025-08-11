import React from "react";
import {
    Box,
    TextField,
    Select,
    MenuItem,
    RadioGroup,
    FormControlLabel,
    Radio,
    Checkbox,
    FormControl,
    FormLabel,
    FormHelperText,
    Typography,
} from "@mui/material";
import type { FieldConfig } from "../types/FieldConfig";

interface Props {
    field: FieldConfig;
    value: any;
    error?: string | null;
    onChange: (id: string, value: any) => void;
}

export const FormField: React.FC<Props> = ({ field, value, error, onChange }) => {
    const disabled = !!field.derived;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange(field.id, e.target.value);
    };

    const renderLabel = () => (
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            {field.label}
        </Typography>
    );

    const renderQuestion = () => {
        const q = (field as any).question;
        if (!q) return null;
        return (
            <FormLabel component="legend" sx={{ mb: 1 }}>
                <Typography variant="body1">{q}</Typography>
            </FormLabel>
        );
    };

    switch (field.type) {
        case "text":
        case "number":
        case "date":
            return (
                <Box>
                    {renderLabel()}
                    <TextField
                        fullWidth
                        label=""
                        type={field.type}
                        value={value ?? ""}
                        onChange={handleInputChange}
                        error={!!error}
                        helperText={error}
                        disabled={disabled}
                        InputLabelProps={field.type === "date" ? { shrink: true } : undefined}
                    />
                </Box>
            );

        case "textarea":
            return (
                <Box>
                    {renderLabel()}
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={value ?? ""}
                        onChange={handleInputChange}
                        error={!!error}
                        helperText={error}
                        disabled={disabled}
                    />
                </Box>
            );

        case "select":
            return (
                <FormControl fullWidth error={!!error} disabled={disabled}>
                    {renderLabel()}
                    {renderQuestion()}
                    <Select
                        value={value ?? ""}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        displayEmpty
                    >

                        {(field.options || []).map((opt, i) => (
                            <MenuItem key={i} value={opt}>
                                {opt}
                            </MenuItem>
                        ))}
                    </Select>
                    {error && <FormHelperText>{error}</FormHelperText>}
                </FormControl>
            );

        case "radio":
            return (
                <FormControl component="fieldset" error={!!error} disabled={disabled}>
                    {renderLabel()}
                    {renderQuestion()}
                    <RadioGroup
                        value={value ?? ""}
                        onChange={(e) => onChange(field.id, e.target.value)}
                    >
                        {(field.options || []).map((opt, i) => (
                            <FormControlLabel
                                key={i}
                                value={opt}
                                control={<Radio />}
                                label={opt}
                                disabled={disabled}
                            />
                        ))}
                    </RadioGroup>
                    {error && <FormHelperText>{error}</FormHelperText>}
                </FormControl>
            );

        case "checkbox":
            return (
                <FormControl component="fieldset" error={!!error} disabled={disabled}>
                    {renderLabel()}
                    {renderQuestion()}
                    <Box>
                        {(field.options || []).map((opt, i) => {
                            const checked = Array.isArray(value) ? value.includes(opt) : false;
                            return (
                                <FormControlLabel
                                    key={i}
                                    control={
                                        <Checkbox
                                            checked={checked}
                                            onChange={(e) => {
                                                let newVal = Array.isArray(value) ? [...value] : [];
                                                if (e.target.checked) {
                                                    newVal.push(opt);
                                                } else {
                                                    newVal = newVal.filter((v: any) => v !== opt);
                                                }
                                                onChange(field.id, newVal);
                                            }}
                                            disabled={disabled}
                                        />
                                    }
                                    label={opt}
                                />
                            );
                        })}
                    </Box>
                    {error && <FormHelperText>{error}</FormHelperText>}
                </FormControl>
            );

        default:
            return null;
    }
};
