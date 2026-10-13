import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Assignment, CreateAssignmentDto } from './types';
import { fetchInitialAssignments } from './assignmentsThunk';
import { INITIAL_ASSIGNMENTS } from '../../utils/dataGenerator';

export { fetchInitialAssignments };

export interface AssignmentsState {
  items: Assignment[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export const initialState: AssignmentsState = {
  items: [],
  status: 'idle',
  error: null
};

export const assignmentsSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {
    addAssignment: (state, action: PayloadAction<CreateAssignmentDto>) => {
      const newAssignment: Assignment = {
        ...action.payload,
        id: `asg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        isCompleted: false,
        createdAt: new Date().toISOString()
      };
      state.items.unshift(newAssignment);
    },
    toggleAssignment: (state, action: PayloadAction<string>) => {
      const target = state.items.find((item) => item.id === action.payload);
      if (target) {
        target.isCompleted = !target.isCompleted;
      }
    },
    deleteAssignment: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    loadBulkAssignments: (state, action: PayloadAction<Assignment[]>) => {
      state.items = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    resetAssignments: (state, action: PayloadAction<Assignment[] | undefined>) => {
      state.items = action.payload ?? [...INITIAL_ASSIGNMENTS];
      state.status = 'succeeded';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInitialAssignments.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchInitialAssignments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
      })
      .addCase(fetchInitialAssignments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Đã xảy ra lỗi khi tải dữ liệu';
      });
  }
});

export const {
  addAssignment,
  toggleAssignment,
  deleteAssignment,
  loadBulkAssignments,
  resetAssignments
} = assignmentsSlice.actions;

export const addDeadline = addAssignment;
export const toggleDeadline = toggleAssignment;
export const deleteDeadline = deleteAssignment;
export const deadlinesSlice = assignmentsSlice;

export default assignmentsSlice.reducer;
