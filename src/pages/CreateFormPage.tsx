import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addField, deleteField, reorderFields, resetFormBuilder } from "../store/formBuilderSlice";
import type { RootState, AppDispatch } from "../store/store";
import type { FieldConfig, FieldType } from "../types/FieldConfig";
import {
    Box,
    Button,
    Typography,
    Paper,
    IconButton,
    TextField,
    Container, // We no longer need Grid, so it can be removed
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import FieldEditor from "../components/FieldEditor";
import { saveFormSchema } from "../utils/localStorage";
import { nanoid } from "nanoid";

/* dnd-kit imports */
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// SortableField component (no changes needed here)
const SortableField: React.FC<{
    field: FieldConfig;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}> = React.memo(({ field, onEdit, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: field.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 999 : undefined,
    };

    return (
        <Box
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            onClick={() => onEdit(field.id)}
            sx={{
                mb: 1, p: 2, border: "1px solid #e0e0e0", borderRadius: 2, bgcolor: "background.paper",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                cursor: "grab", userSelect: "none", "&:hover": { borderColor: 'primary.main' }
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
    );
});
SortableField.displayName = "SortableField";


export default function CreateForm() {
    const dispatch = useDispatch<AppDispatch>();
    const fields = useSelector((state: RootState) => state.formBuilder.fields);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [formName, setFormName] = useState("");

    useEffect(() => {
        dispatch(resetFormBuilder());
    }, [dispatch]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

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
    }, [dispatch, fields.length]);

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
            {/* FIXED: Replaced Grid with a standard, reliable Flexbox layout using Box */}
            <Box sx={{
                display: 'flex',
                // On small screens (xs), stack vertically. On medium screens (md) and up, place side-by-side.
                flexDirection: { xs: 'column', md: 'row' },
                gap: 4 // This creates the space between the two columns
            }}>
                {/* Left Column (5/12 width on medium screens) */}
                <Box sx={{ width: { xs: '100%', md: '41.66%' } }}>
                    <Box display="flex" flexDirection="column" height="100%">
                        <Button
                            variant="contained"
                            size="large"
                            onClick={onAddField}
                            sx={{ mb: 2 }}
                        >
                            + Add new field
                        </Button>
                        <Paper
                            variant="outlined"
                            sx={{ p: 2, flexGrow: 1, borderColor: '#e0e0e0' }}
                        >
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                                    {fields.length > 0 ? fields.map((field) => (
                                        <SortableField
                                            key={field.id}
                                            field={field}
                                            onEdit={setEditingField}
                                            onDelete={onDeleteField}
                                        />
                                    )) : (
                                        <Typography sx={{ color: 'text.secondary', textAlign: 'center', mt: 4 }}>
                                            Add a field to get started
                                        </Typography>
                                    )}
                                </SortableContext>
                            </DndContext>
                        </Paper>
                        <Box mt={2}>
                            <TextField
                                fullWidth
                                label="Form name"
                                variant="outlined"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                sx={{ mb: 2 }}
                            />
                            <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                onClick={() => saveFormSchema(formName, fields)}
                                disabled={!formName.trim() || fields.length === 0}
                            >
                                Save
                            </Button>
                        </Box>
                    </Box>
                </Box>

                {/* Right Column (7/12 width on medium screens) */}
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