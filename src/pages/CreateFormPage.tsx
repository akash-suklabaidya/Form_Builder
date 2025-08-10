import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addField, deleteField, reorderFields, resetFormBuilder } from "../store/formBuilderSlice";
import type { RootState, AppDispatch } from "../store/store";
import type { FieldConfig } from "../types/FieldConfig";
import {
    Box,
    Button,
    Typography,
    Paper,
    IconButton,
    Divider,
    Dialog,
    DialogTitle,
    DialogActions,
    TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import FieldEditor from "../components/FieldEditor";
import { saveFormSchema } from "../utils/localStorage";

/* dnd-kit imports */
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,

} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* --------------------------------------------------
   SortableField component: small, memoized, and fast
   -------------------------------------------------- */
const SortableField: React.FC<{
    field: FieldConfig;
    index: number;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    isDraggingId: string | null;
}> = React.memo(({ field, index, onEdit, onDelete, isDraggingId }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: field.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        // keep high zIndex when dragging
        zIndex: isDragging ? 999 : undefined,
    };

    return (
        <Box
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            onClick={() => {
                // if currently dragging, don't treat as click
                if (!isDragging) onEdit(field.id);
            }}
            sx={{
                mb: 1,
                p: 1,
                border: "1px solid #ccc",
                borderRadius: 1,
                bgcolor: isDragging ? "grey.100" : "background.paper",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "grab",
                userSelect: "none",
            }}
            style={style}
            aria-roledescription="Draggable field"
        >
            <Typography sx={{ mr: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                {field.label || field.type}
            </Typography>

            <IconButton
                aria-label={`Delete ${field.label || field.type}`}
                size="small"
                onClick={(e) => {
                    e.stopPropagation(); // don't trigger edit
                    onDelete(field.id);
                }}
            >
                <DeleteIcon />
            </IconButton>
        </Box>
    );
});
SortableField.displayName = "SortableField";

/* --------------------------------------------------
   Main CreateForm component
   -------------------------------------------------- */
export default function CreateForm() {
    const dispatch = useDispatch<AppDispatch>();
    const fields = useSelector((state: RootState) => state.formBuilder.fields);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [saveDialog, setSaveDialog] = useState(false);
    const [formName, setFormName] = useState("");
    // track currently active dragging id so clicks while dragging are ignored
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        // This runs once when the component loads, ensuring a clean state.
        dispatch(resetFormBuilder());
    }, [dispatch]);

    /* dnd-kit sensors */
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // small threshold to avoid accidental drags on click
            },
        })
    );

    const handleSaveForm = useCallback(() => {
        saveFormSchema(formName, fields);
        setSaveDialog(false);
    }, [formName, fields]);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveId(String(event.active.id));
    }, []);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            setActiveId(null);

            if (!over) return;

            const activeIdStr = String(active.id);
            const overIdStr = String(over.id);

            if (activeIdStr === overIdStr) return;

            const oldIndex = fields.findIndex((f) => f.id === activeIdStr);
            const newIndex = fields.findIndex((f) => f.id === overIdStr);

            if (oldIndex === -1 || newIndex === -1) return;

            // dispatch reducer that expects startIndex and endIndex
            dispatch(
                reorderFields({
                    startIndex: oldIndex,
                    endIndex: newIndex,
                })
            );
        },
        [dispatch, fields]
    );

    const onAddField = useCallback(() => {
        dispatch(
            addField({
                type: "text",
                label: "",
                validations: {
                    required: false,
                    passwordRule: false,
                },
            })
        );
    }, [dispatch]);

    const onDeleteField = useCallback(
        (id: string) => {
            dispatch(deleteField(id));
            // if deleted field was being edited, clear editor
            if (editingField === id) setEditingField(null);
        },
        [dispatch, editingField]
    );

    // memoize ids for SortableContext
    const ids = useMemo(() => fields.map((f) => f.id), [fields]);

    return (
        <Box display="flex" p={2} gap={2}>
            {/* Left Panel - Field List */}
            <Paper sx={{ flex: 1, p: 2 }}>
                <Typography variant="h6">Fields</Typography>
                <Divider sx={{ my: 1 }} />

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                        <Box>
                            {fields.map((field, index) => (
                                <SortableField
                                    key={field.id}
                                    field={field}
                                    index={index}
                                    onEdit={(id) => setEditingField(id)}
                                    onDelete={onDeleteField}
                                    isDraggingId={activeId}
                                />
                            ))}
                        </Box>
                    </SortableContext>
                </DndContext>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={onAddField}
                >
                    Add Field
                </Button>

                <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => setSaveDialog(true)}
                    disabled={!fields.length}
                >
                    Save Form
                </Button>
            </Paper>

            {/* Right Panel - Field Editor */}
            <Paper sx={{ flex: 2, p: 2 }}>
                {editingField ? (
                    <FieldEditor fieldId={editingField} />
                ) : (
                    <Typography>Select a field to edit</Typography>
                )}
            </Paper>

            {/* Save Dialog */}
            <Dialog open={saveDialog} onClose={() => setSaveDialog(false)}>
                <DialogTitle>Enter Form Name</DialogTitle>
                <Box p={2}>
                    <TextField
                        fullWidth
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                    />
                </Box>
                <DialogActions>
                    <Button onClick={() => setSaveDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleSaveForm}
                        disabled={!formName.trim()}
                        variant="contained"
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}



// src/pages/CreateFormPage.tsx

// import React, { useCallback, useMemo, useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { addField, deleteField, reorderFields, resetFormBuilder } from "../store/formBuilderSlice";
// import type { RootState, AppDispatch } from "../store/store";
// import type { FieldConfig } from "../types/FieldConfig";
// import { Box, Button, Typography, Paper, IconButton, Divider, Dialog, DialogTitle, DialogActions, TextField } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
// import AddIcon from "@mui/icons-material/Add";
// import FieldEditor from "../components/FieldEditor";
// import { saveFormSchema } from "../utils/localStorage";

// /* dnd-kit imports */
// import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// // Your SortableField component remains the same
// const SortableField: React.FC<{
//     field: FieldConfig;
//     onEdit: (id: string) => void;
//     onDelete: (id: string) => void;
// }> = React.memo(({ field, onEdit, onDelete }) => {
//     const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
//     const style: React.CSSProperties = {
//         transform: CSS.Transform.toString(transform),
//         transition,
//         zIndex: isDragging ? 999 : undefined,
//     };
//     return (
//         <Box ref={setNodeRef} {...attributes} {...listeners} onClick={() => onEdit(field.id)}
//             sx={{ mb: 1, p: 1, border: "1px solid #ccc", borderRadius: 1, bgcolor: "background.paper", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "grab", userSelect: "none" }}
//             style={style}>
//             <Typography sx={{ mr: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{field.label || field.type}</Typography>
//             <IconButton aria-label={`Delete ${field.label || field.type}`} size="small" onClick={(e) => { e.stopPropagation(); onDelete(field.id); }}>
//                 <DeleteIcon />
//             </IconButton>
//         </Box>
//     );
// });
// SortableField.displayName = "SortableField";

// export default function CreateForm() {
//     const dispatch = useDispatch<AppDispatch>();
//     const fields = useSelector((state: RootState) => state.formBuilder.fields);
//     const [editingField, setEditingField] = useState<string | null>(null);
//     const [saveDialog, setSaveDialog] = useState(false);
//     const [formName, setFormName] = useState("");

//     // This hook is still important to ensure a clean state
//     useEffect(() => {
//         dispatch(resetFormBuilder());
//     }, [dispatch]);

//     const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
//     const handleSaveForm = useCallback(() => { saveFormSchema(formName, fields); setSaveDialog(false); }, [formName, fields]);

//     const handleDragEnd = useCallback((event: DragEndEvent) => {
//         const { active, over } = event;
//         if (!over || active.id === over.id) return;
//         const oldIndex = fields.findIndex((f) => f.id === active.id);
//         const newIndex = fields.findIndex((f) => f.id === over.id);
//         dispatch(reorderFields({ startIndex: oldIndex, endIndex: newIndex }));
//     }, [dispatch, fields]);

//     const onAddField = useCallback(() => { dispatch(addField({ type: "text", label: `Field #${fields.length + 1}`, validations: { required: false, passwordRule: false } })); }, [dispatch, fields.length]);
//     const onDeleteField = useCallback((id: string) => { dispatch(deleteField(id)); if (editingField === id) setEditingField(null); }, [dispatch, editingField]);

//     // Memoize IDs for SortableContext, but only if fields exist
//     const fieldIds = useMemo(() => fields.map((f) => f.id), [fields]);

//     return (
//         <Box display="flex" p={2} gap={2}>
//             {/* Left Panel - Field List */}
//             <Paper sx={{ flex: 1, p: 2 }}>
//                 <Typography variant="h6">Fields</Typography>
//                 <Divider sx={{ my: 1 }} />

//                 {/* 👇 THIS IS THE KEY CHANGE 👇 */}
//                 {/* Only render DndContext if there are fields to sort. */}
//                 {/* This prevents dnd-kit from crashing with an empty/invalid state. */}
//                 {fields.length > 0 ? (
//                     <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//                         <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
//                             <Box>
//                                 {fields.map((field) => (
//                                     <SortableField key={field.id} field={field} onEdit={setEditingField} onDelete={onDeleteField} />
//                                 ))}
//                             </Box>
//                         </SortableContext>
//                     </DndContext>
//                 ) : (
//                     <Typography sx={{ my: 2, color: 'text.secondary' }}>Add a new field to begin.</Typography>
//                 )}

//                 <Button variant="contained" startIcon={<AddIcon />} fullWidth sx={{ mt: 2 }} onClick={onAddField}>Add Field</Button>
//                 <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={() => setSaveDialog(true)} disabled={!fields.length}>Save Form</Button>
//             </Paper>

//             {/* Right Panel - Field Editor */}
//             <Paper sx={{ flex: 2, p: 2 }}>
//                 {editingField ? (<FieldEditor fieldId={editingField} />) : (<Typography>Select a field to edit</Typography>)}
//             </Paper>

//             {/* Save Dialog */}
//             <Dialog open={saveDialog} onClose={() => setSaveDialog(false)}>
//                 <DialogTitle>Enter Form Name</DialogTitle>
//                 <Box p={2}><TextField fullWidth value={formName} onChange={(e) => setFormName(e.target.value)} /></Box>
//                 <DialogActions>
//                     <Button onClick={() => setSaveDialog(false)}>Cancel</Button>
//                     <Button onClick={handleSaveForm} disabled={!formName.trim()} variant="contained">Save</Button>
//                 </DialogActions>
//             </Dialog>
//         </Box>
//     );
// }