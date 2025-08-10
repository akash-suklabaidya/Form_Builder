



import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { updateField } from '../store/formBuilderSlice';
import type { RootState } from '../store/store';
import type { FieldConfig, FieldType } from '../types/FieldConfig';

// Static data for field type options
const fieldTypes: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Select' },
  { value: 'radio', label: 'Radio' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'date', label: 'Date' },
];

// Define the list of available formulas for derived fields
const availableFormulas = [
  { value: 'ageFromDob', label: 'Calculate Age from Date' },
  { value: 'concatenate', label: 'Combine Text (e.g., Full Name)' },
  { value: 'sum', label: 'Sum of Numbers' },
];

interface FieldEditorProps {
  fieldId: string;
}

export default function FieldEditor({ fieldId }: FieldEditorProps) {
  const dispatch = useDispatch();

  // Select all fields to populate the Parent Fields dropdown
  const allFields = useSelector((state: RootState) => state.formBuilder.fields);
  const field = allFields.find((f) => f.id === fieldId);

  if (!field) {
    return <Typography>Field not found. Please select a field.</Typography>;
  }

  // Generic update handler for top-level field properties
  const update = (key: keyof FieldConfig, value: any) => {
    dispatch(updateField({ ...field, [key]: value }));
  };

  // Specific update handler for properties within the 'derived' object
  const updateDerived = (derivedKey: string, value: any) => {
    dispatch(
      updateField({
        ...field,
        derived: { ...field.derived, [derivedKey]: value },
      })
    );
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <TextField
        select
        label="Field Type"
        value={field.type}
        onChange={(e) => update('type', e.target.value)}
      >
        {fieldTypes.map((ft) => (
          <MenuItem key={ft.value} value={ft.value}>
            {ft.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Label"
        value={field.label}
        onChange={(e) => update('label', e.target.value)}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={!!field.validations?.required}
            onChange={(e) =>
              update('validations', {
                ...field.validations,
                required: e.target.checked,
              })
            }
          />
        }
        label="Required"
      />

      <TextField
        label="Default Value"
        value={field.defaultValue || ''}
        onChange={(e) => update('defaultValue', e.target.value)}
      />

      {/* Validations Section */}
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Validations
      </Typography>
      <TextField
        label="Min Length"
        type="number"
        value={field.validations?.minLength || ''}
        onChange={(e) =>
          update('validations', {
            ...field.validations,
            minLength: Number(e.target.value),
          })
        }
      />
      <TextField
        label="Max Length"
        type="number"
        value={field.validations?.maxLength || ''}
        onChange={(e) =>
          update('validations', {
            ...field.validations,
            maxLength: Number(e.target.value),
          })
        }
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={!!field.validations?.email}
            onChange={(e) =>
              update('validations', { ...field.validations, email: e.target.checked })
            }
          />
        }
        label="Email format"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={!!field.validations?.passwordRule}
            onChange={(e) =>
              update('validations', {
                ...field.validations,
                passwordRule: e.target.checked,
              })
            }
          />
        }
        label="Password rule (min 8 chars, 1 number)"
      />

      {/* Derived Field Section */}
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Derived Field
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            checked={!!field.derived}
            onChange={(e) =>
              update(
                'derived',
                e.target.checked ? { parents: [], formula: '' } : undefined
              )
            }
          />
        }
        label="Mark as Derived Field"
      />

      {/* Show these options only if the field is marked as derived */}
      {field.derived && (
        <>
          <FormControl fullWidth>
            <InputLabel id="parent-field-select-label">Parent Fields</InputLabel>
            <Select
              labelId="parent-field-select-label"
              multiple
              value={field.derived.parents || []}
              onChange={(e) => updateDerived('parents', e.target.value)}
              renderValue={(selected) =>
                selected
                  .map((id) => allFields.find((f) => f.id === id)?.label || id)
                  .join(', ')
              }
            >
              {allFields
                .filter((f) => f.id !== field.id && !f.derived) // Exclude self and other derived fields
                .map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    <Checkbox
                      checked={
                        (field.derived?.parents || []).indexOf(f.id) > -1
                      }
                    />
                    <ListItemText primary={f.label} />
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            select
            label="Formula / Logic"
            value={field.derived.formula || ''}
            onChange={(e) => updateDerived('formula', e.target.value)}
          >
            {availableFormulas.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </>
      )}
    </Box>
  );
}

