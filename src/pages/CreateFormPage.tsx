import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addField, deleteField, reorderFields, resetFormBuilder } from '../store/formBuilderSlice';
import type { RootState, AppDispatch } from '../store/store';
import type { FieldConfig, FieldType } from '../types/FieldConfig';
import {
    Box,
    Button,
    Typography,
    Paper,
    IconButton,
    TextField,
    Container,
    Snackbar,
    Alert,
    Tooltip,
    Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FieldEditor from '../components/FieldEditor';
import { saveFormSchema } from '../utils/localStorage';
import { nanoid } from 'nanoid';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableField: React.FC<{
    field: FieldConfig;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    tooltipOpen: boolean;
}> = React.memo(({ field, onEdit, onDelete, tooltipOpen }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: field.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 999 : undefined,
    };

    return (
        <Tooltip
            open={tooltipOpen}
            title="Click here to customize field"
            placement="right"
            arrow
        >
            <Box
                ref={setNodeRef}
                {...attributes}
                {...listeners}
                onClick={() => onEdit(field.id)}
                sx={{
                    mb: 1,
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'grab',
                    userSelect: 'none',
                    "&:hover": { borderColor: 'primary.main' }
                }}
                style={style}
                aria-roledescription="Draggable field"
            >
                <Typography sx={{ fontWeight: 'medium' }}>
                    {field.label || `Untitled ${field.type} field`}
                </Typography>
                <IconButton
                    aria-label={`Delete ${field.label || field.type}`}
                    size="small"
                    onClick={(e) => { e.stopPropagation(); onDelete(field.id); }}
                >
                    <DeleteIcon />
                </IconButton>
            </Box>
        </Tooltip>
    );
});
SortableField.displayName = "SortableField";

export default function CreateForm() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const fields = useSelector((state: RootState) => state.formBuilder.fields);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [formName, setFormName] = useState("");

    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [firstTooltipShown, setFirstTooltipShown] = useState(false);
    const [highlightSave, setHighlightSave] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleSave = useCallback(() => {
        saveFormSchema(formName, fields);
        setSnackbarOpen(true);
        localStorage.setItem("showMyFormsTooltip", "true");

        dispatch(resetFormBuilder());
        setFormName("");
        setEditingField(null);

    }, [formName, fields, dispatch]);

    const handlePreview = useCallback(() => {
        const formSchemaForPreview = {
            id: 'preview_id',
            name: formName || 'Untitled Form',
            fields,
        };
        navigate('/preview', { state: { formSchema: formSchemaForPreview } });
    }, [navigate, formName, fields]);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (over && active.id !== over.id) {
                const oldIndex = fields.findIndex((f) => f.id === active.id);
                const newIndex = fields.findIndex((f) => f.id === over.id);
                dispatch(reorderFields({ startIndex: oldIndex, endIndex: newIndex }));
            }
        },
        [dispatch, fields]
    );

    const onAddField = useCallback(() => {
        const newField = {
            id: nanoid(),
            type: "text" as FieldType,
            label: `New Field ${fields.length + 1}`,
            validations: { required: false },
        };
        dispatch(addField(newField));
        setEditingField(newField.id);

        setHighlightSave(true);
        setTimeout(() => setHighlightSave(false), 2000);

        if (!firstTooltipShown) {
            setTimeout(() => {
                setTooltipOpen(true);
                setTimeout(() => {
                    setTooltipOpen(false);
                }, 4000);
            }, 50);
            setFirstTooltipShown(true);
        }
    }, [dispatch, fields.length, firstTooltipShown]);

    const onDeleteField = useCallback(
        (id: string) => {
            dispatch(deleteField(id));
            if (editingField === id) setEditingField(null);
        },
        [dispatch, editingField]
    );

    const ids = useMemo(() => fields.map((f) => f.id), [fields]);

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 4
            }}>
                <Box sx={{ width: { xs: '100%', md: '41.66%' } }}>
                    <Box display="flex" flexDirection="column" height="100%">
                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={onAddField}
                                sx={{ flexGrow: 1 }}
                            >
                                + Add new field
                            </Button>
                            <Tooltip title="Preview current form">
                                <span>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        onClick={handlePreview}
                                        disabled={fields.length === 0}
                                        startIcon={<VisibilityIcon />}
                                    >
                                        Preview
                                    </Button>
                                </span>
                            </Tooltip>
                        </Stack>

                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderColor: '#e0e0e0',
                                mb: 2,
                                maxHeight: '60vh',
                                overflowY: 'auto'
                            }}
                        >
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                                    {fields.length > 0 ? fields.map((field, index) => (
                                        <SortableField
                                            key={field.id}
                                            field={field}
                                            onEdit={setEditingField}
                                            onDelete={onDeleteField}
                                            tooltipOpen={tooltipOpen && index === fields.length - 1}
                                        />
                                    )) : (
                                        <Typography sx={{ color: 'text.secondary', textAlign: 'center', mt: 4 }}>
                                            Add a field to get started
                                        </Typography>
                                    )}
                                </SortableContext>
                            </DndContext>
                        </Paper>

                        <Paper
                            elevation={3}
                            sx={{
                                p: 2,
                                mt: 3,
                                borderRadius: 2,
                                border: '2px solid',
                                borderColor: highlightSave ? 'primary.main' : 'transparent',
                                transition: 'border-color 0.3s ease'
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                Save Your Form
                            </Typography>
                            <TextField
                                fullWidth
                                label="Form Name"
                                variant="outlined"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                sx={{ mb: 1 }}
                                helperText="Enter a unique name to save and reuse later"
                            />
                            <Tooltip
                                title={
                                    !formName.trim()
                                        ? "Please enter a form name"
                                        : fields.length === 0
                                            ? "Add at least one field before saving"
                                            : ""
                                }
                                arrow
                                disableHoverListener={formName.trim().length > 0 && fields.length > 0}
                            >
                                <span>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        onClick={handleSave}
                                        disabled={!formName.trim() || fields.length === 0}
                                    >
                                        Save Form
                                    </Button>
                                </span>
                            </Tooltip>

                            <Snackbar
                                open={snackbarOpen}
                                autoHideDuration={3000}
                                onClose={() => setSnackbarOpen(false)}
                                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                            >
                                <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
                                    Form saved successfully!
                                </Alert>
                            </Snackbar>
                        </Paper>
                    </Box>
                </Box>

                <Box sx={{ width: { xs: '100%', md: '58.33%' } }}>
                    <Paper
                        variant="outlined"
                        sx={{ p: 3, minHeight: '60vh', borderColor: '#e0e0e0' }}
                    >
                        {editingField ? (
                            <FieldEditor fieldId={editingField} />
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <Typography sx={{ color: 'text.secondary' }}>
                                    Select a field to edit
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Box>
            </Box>
        </Container>
    );
}