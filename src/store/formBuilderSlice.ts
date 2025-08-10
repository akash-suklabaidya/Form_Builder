import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type FieldConfig } from '../types/FieldConfig';
import { v4 as uuidv4 } from 'uuid';

interface FormBuilderState {
  fields: FieldConfig[];
}

const initialState: FormBuilderState = {
  fields: [],
};

const formBuilderSlice = createSlice({
  name: 'formBuilder',
  initialState,
  reducers: {
    addField: (state, action: PayloadAction<Omit<FieldConfig, 'id'>>) => {
      state.fields.push({ ...action.payload, id: uuidv4() });
    },
    updateField: (state, action: PayloadAction<FieldConfig>) => {
      const index = state.fields.findIndex(f => f.id === action.payload.id);
      if (index !== -1) state.fields[index] = action.payload;
    },
    deleteField: (state, action: PayloadAction<string>) => {
      state.fields = state.fields.filter(f => f.id !== action.payload);
    },
    reorderFields: (
      state,
      action: PayloadAction<{ startIndex: number; endIndex: number }>
    ) => {
      const [removed] = state.fields.splice(action.payload.startIndex, 1);
      state.fields.splice(action.payload.endIndex, 0, removed);
    },
    resetFormBuilder: (state) => {
      state.fields = [];
    },
  },
});

export const {
  addField,
  updateField,
  deleteField,
  reorderFields,
  resetFormBuilder,
} = formBuilderSlice.actions;
export default formBuilderSlice.reducer;


