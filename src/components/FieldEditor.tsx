import { useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import { updateField } from '../store/formBuilderSlice';
import type { RootState } from '../store/store';
import type { FieldConfig, FieldType } from '../types/FieldConfig';

const fieldTypes: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Select' },
  { value: 'radio', label: 'Radio' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'date', label: 'Date' },
];

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
  const allFields = useSelector((s: RootState) => s.formBuilder.fields);
  const field = allFields.find((f) => f.id === fieldId) ?? undefined;

  const handleUpdate = useCallback(
    (key: keyof FieldConfig, value: any) => {
      if (!field) return;

      const updatedFieldAny: any = { ...field, [key]: value };

      if (key === 'type') {
        const needsOptions = ['select', 'radio', 'checkbox'].includes(value);
        if (needsOptions && !updatedFieldAny.options) {
          updatedFieldAny.options = ['Option 1'];
        }
        if (value === 'checkbox' && !Array.isArray(updatedFieldAny.defaultValue)) {
          updatedFieldAny.defaultValue = [];
        }
        if (needsOptions && updatedFieldAny.question === undefined) {
          updatedFieldAny.question = '';
        }
      }

      dispatch(updateField(updatedFieldAny as FieldConfig));
    },
    [dispatch, field]
  );

  const update = useCallback(
    (key: keyof FieldConfig | string, value: any) => {
      if (!field) return;
      const next: any = { ...field, [key]: value };
      dispatch(updateField(next as FieldConfig));
    },
    [dispatch, field]
  );

  const updateDerived = useCallback(
    (derivedKey: string, value: any) => {
      if (!field) return;

      const currentDerived = field.derived || {};
      dispatch(
        updateField({
          ...field,
          derived: { ...currentDerived, [derivedKey]: value },
        })
      );
    },
    [dispatch, field]
  );

  const handleOptionChange = useCallback(
    (index: number, optionValue: string) => {
      if (!field) return;
      const newOptions = [...(field.options || [])];
      newOptions[index] = optionValue;
      update('options', newOptions);
    },
    [field, update]
  );

  const addOption = useCallback(() => {
    if (!field) return;
    const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
    update('options', newOptions);
  }, [field, update]);

  const deleteOption = useCallback(
    (index: number) => {
      if (!field) return;
      const newOptions = (field.options || []).filter((_, i) => i !== index);
      update('options', newOptions);
    },
    [field, update]
  );

  const parentValuesSnapshot = useMemo(() => {
    if (!field?.derived?.parents?.length) return '';
    return field.derived.parents
      .map((pid) => {
        const p = allFields.find((f) => f.id === pid);
        return `${pid}:${String(p?.defaultValue ?? '')}`;
      })
      .join('|');
  }, [field?.derived?.parents, allFields]);

  useEffect(() => {
    if (!field || !field.derived || !field.derived.parents?.length || !field.derived.formula) {
      return;
    }

    try {
      const parentValues = field.derived.parents.map((pid) => {
        const p = allFields.find((f) => f.id === pid);
        return p?.defaultValue ?? '';
      });

      let computedValue: any = '';

      switch (field.derived.formula) {
        case 'ageFromDob': {
          const raw = parentValues[0];
          if (!raw) {
            computedValue = '';
            break;
          }
          const dob = new Date(String(raw));
          if (isNaN(dob.getTime())) {
            computedValue = '';
            break;
          }
          const today = new Date();
          let age = today.getFullYear() - dob.getFullYear();
          const m = today.getMonth() - dob.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
          }
          computedValue = age;
          break;
        }

        case 'concatenate':
          computedValue = parentValues.map((v) => (v ?? '')).join(' ').trim();
          break;

        case 'sum': {
          computedValue = parentValues
            .map((v) => {
              const n = typeof v === 'number' ? v : parseFloat(String(v));
              return Number.isFinite(n) ? n : 0;
            })
            .reduce((a, b) => a + b, 0);
          break;
        }

        default:
          computedValue = '';
      }

      const prev = field.defaultValue;
      if (String(prev) !== String(computedValue)) {
        dispatch(updateField({ ...field, defaultValue: computedValue }));
      }
    } catch (err) {
      console.error('Derived compute error', err);
    }
  }, [parentValuesSnapshot, field?.derived?.formula, field?.id, dispatch, allFields, field?.defaultValue, field]);

  if (!field) {
    return <Typography>Field not found. Please select a field.</Typography>;
  }

  const isQuestionType = ['select', 'radio', 'checkbox'].includes(field.type);

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <TextField
        select
        label="Field Type"
        value={field.type}
        onChange={(e) => handleUpdate('type', e.target.value as FieldType)}
      >
        {fieldTypes.map((ft) => (
          <MenuItem key={ft.value} value={ft.value}>
            {ft.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Label"
        value={field.label ?? ''}
        onChange={(e) => update('label', e.target.value)}
      />

      {isQuestionType && (
        <Box sx={{ border: '1px solid #e0e0e0', p: 2, borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Options
          </Typography>
          {(field.options || []).map((option, index) => (
            <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
              <TextField
                fullWidth
                size="small"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                label={`Option ${index + 1}`}
              />
              <IconButton size="small" onClick={() => deleteOption(index)} aria-label="Delete option">
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button onClick={addOption}>+ Add Option</Button>
        </Box>
      )}

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
        value={field.defaultValue ?? ''}
        onChange={(e) => update('defaultValue', e.target.value)}
        helperText={field.type === 'checkbox' ? 'For checkboxes, separate multiple values with a comma' : ''}
      />

      <Typography variant="subtitle1" sx={{ mt: 1 }}>
        Validations
      </Typography>
      <TextField
        label="Min Length"
        type="number"
        value={field.validations?.minLength ?? ''}
        onChange={(e) =>
          update('validations', {
            ...field.validations,
            minLength: e.target.value === '' ? undefined : Number(e.target.value),
          })
        }
      />
      <TextField
        label="Max Length"
        type="number"
        value={field.validations?.maxLength ?? ''}
        onChange={(e) =>
          update('validations', {
            ...field.validations,
            maxLength: e.target.value === '' ? undefined : Number(e.target.value),
          })
        }
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={!!field.validations?.email}
            onChange={(e) => update('validations', { ...field.validations, email: e.target.checked })}
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

      <Typography variant="subtitle1" sx={{ mt: 1 }}>
        Derived Field
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            checked={!!field.derived}
            onChange={(e) =>
              update('derived', e.target.checked ? { parents: [], formula: '' } : undefined)
            }
          />
        }
        label="Mark as Derived Field"
      />

      {field.derived && (
        <>
          <FormControl fullWidth>
            <InputLabel id="parent-field-select-label">Parent Fields</InputLabel>
            <Select
              labelId="parent-field-select-label"
              multiple
              value={field.derived.parents || []}
              onChange={(e) => {
                const val = e.target.value as string[];
                updateDerived('parents', val);
              }}
              renderValue={(selected) =>
                (selected as string[])
                  .map((id) => allFields.find((f) => f.id === id)?.label || id)
                  .join(', ')
              }
            >
              {allFields
                .filter((f) => f.id !== field.id && !f.derived)
                .map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    <Checkbox checked={(field.derived?.parents || []).indexOf(f.id) > -1} />
                    <ListItemText primary={f.label} />
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            select
            label="Formula / Logic"
            value={field.derived.formula ?? ''}
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