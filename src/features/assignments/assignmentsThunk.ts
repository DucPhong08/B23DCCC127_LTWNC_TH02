import { createAsyncThunk } from '@reduxjs/toolkit';
import type { ApiResponse, Assignment } from './types';
import { INITIAL_ASSIGNMENTS } from '../../utils/dataGenerator';

export const fetchInitialAssignments = createAsyncThunk<ApiResponse<Assignment[]>, void>(
  'assignments/fetchInitialAssignments',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const response: ApiResponse<Assignment[]> = {
        data: INITIAL_ASSIGNMENTS,
        status: 200,
        message: 'Lấy danh sách bài tập thành công',
        timestamp: new Date().toISOString()
      };

      return response;
    } catch {
      return rejectWithValue('Không thể kết nối đến máy chủ mock API');
    }
  }
);

export const fetchInitialDeadlines = fetchInitialAssignments;
