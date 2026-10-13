import { describe, it, expect } from 'vitest';
import {
  isOverdue,
  calcDaysLeft,
  calcStats,
  type Assignment
} from '../features/assignments/types';
import assignmentsReducer, {
  addAssignment,
  toggleAssignment,
  deleteAssignment,
  loadBulkAssignments,
  resetAssignments,
  fetchInitialAssignments,
  initialState
} from '../features/assignments/assignmentsSlice';
import { setupTestStore } from '../app/store';

describe('Unit Tests: Helpers & Reducer (Yêu cầu Phần C)', () => {
  // 1. Kiểm thử isOverdue
  describe('isOverdue', () => {
    it('trả về false nếu bài tập đã hoàn thành, kể cả hạn nộp trong quá khứ', () => {
      expect(isOverdue('2020-01-01', true)).toBe(false);
    });

    it('trả về true nếu hạn nộp ở quá khứ và chưa hoàn thành', () => {
      const pastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      expect(isOverdue(pastDate, false)).toBe(true);
    });

    it('trả về false nếu hạn nộp ở tương lai và chưa hoàn thành', () => {
      const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      expect(isOverdue(futureDate, false)).toBe(false);
    });

    it('xử lý trường hợp biên: ngày dueDate rỗng hoặc không hợp lệ', () => {
      expect(isOverdue('', false)).toBe(false);
      expect(isOverdue('invalid-date', false)).toBe(false);
    });
  });

  // 2. Kiểm thử calcDaysLeft
  describe('calcDaysLeft', () => {
    it('tính chính xác 0 ngày cho hạn chót hôm nay', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(calcDaysLeft(today)).toBe(0);
    });

    it('tính số ngày dương cho hạn nộp ở tương lai', () => {
      const target = new Date();
      target.setDate(target.getDate() + 4);
      const futureStr = target.toISOString().split('T')[0];
      expect(calcDaysLeft(futureStr)).toBe(4);
    });

    it('tính số ngày âm cho hạn nộp ở quá khứ', () => {
      const target = new Date();
      target.setDate(target.getDate() - 3);
      const pastStr = target.toISOString().split('T')[0];
      expect(calcDaysLeft(pastStr)).toBe(-3);
    });

    it('xử lý trường hợp biên: chuỗi ngày rỗng hoặc sai định dạng', () => {
      expect(calcDaysLeft('')).toBe(0);
      expect(calcDaysLeft('not-a-date')).toBe(0);
    });
  });

  // 3. Kiểm thử calcStats
  describe('calcStats', () => {
    it('tính toán chính xác cho danh sách rỗng (trường hợp biên)', () => {
      const stats = calcStats([]);
      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.overdue).toBe(0);
      expect(stats.active).toBe(0);
      expect(stats.completionRate).toBe(0);
      expect(Object.keys(stats.byCourse)).toHaveLength(0);
    });

    it('tính toán chính xác tổng bài, hoàn thành, quá hạn, phân bổ môn học và mức ưu tiên', () => {
      const items: Assignment[] = [
        {
          id: '1',
          course: 'LTWNC',
          title: 'Bài 1',
          dueDate: '2020-01-01', // Quá hạn
          priority: 'high',
          isCompleted: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          course: 'LTWNC',
          title: 'Bài 2',
          dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], // Active
          priority: 'medium',
          isCompleted: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          course: 'CSDL',
          title: 'Bài 3',
          dueDate: '2020-01-01',
          priority: 'low',
          isCompleted: true, // Đã hoàn thành
          createdAt: new Date().toISOString()
        }
      ];

      const stats = calcStats(items);
      expect(stats.total).toBe(3);
      expect(stats.completed).toBe(1);
      expect(stats.overdue).toBe(1);
      expect(stats.active).toBe(1);
      expect(stats.completionRate).toBe(33); // 1/3 = 33%
      expect(stats.byCourse['LTWNC'].total).toBe(2);
      expect(stats.byCourse['LTWNC'].overdue).toBe(1);
      expect(stats.byCourse['CSDL'].completed).toBe(1);
      expect(stats.byPriority.high).toBe(1);
      expect(stats.byPriority.medium).toBe(1);
      expect(stats.byPriority.low).toBe(1);
    });
  });

  // 4. Kiểm thử assignmentsSlice reducer
  describe('assignmentsSlice reducer', () => {
    it('reducer trả về initialState khi action không xác định', () => {
      const state = assignmentsReducer(undefined, { type: 'UNKNOWN_ACTION' });
      expect(state).toEqual(initialState);
    });

    it('addAssignment: thêm bài tập mới vào đầu danh sách với đầy đủ thuộc tính', () => {
      const prevState = { items: [], status: 'idle' as const, error: null };
      const action = addAssignment({
        course: 'Kiến trúc phần mềm',
        title: 'Thiết kế hệ thống',
        dueDate: '2026-10-20',
        priority: 'high',
        isCompleted: false
      });

      const nextState = assignmentsReducer(prevState, action);
      expect(nextState.items).toHaveLength(1);
      expect(nextState.items[0].course).toBe('Kiến trúc phần mềm');
      expect(nextState.items[0].title).toBe('Thiết kế hệ thống');
      expect(nextState.items[0].isCompleted).toBe(false);
      expect(nextState.items[0].id).toBeDefined();
      expect(nextState.items[0].createdAt).toBeDefined();
    });

    it('toggleAssignment: đảo ngược trạng thái hoàn thành của bài tập', () => {
      const prevState = {
        items: [
          {
            id: 'test-1',
            course: 'LTWNC',
            title: 'Bài thực hành',
            dueDate: '2026-10-15',
            priority: 'medium' as const,
            isCompleted: false,
            createdAt: '2026-10-13'
          }
        ],
        status: 'succeeded' as const,
        error: null
      };

      // Đảo từ false -> true
      let state = assignmentsReducer(prevState, toggleAssignment('test-1'));
      expect(state.items[0].isCompleted).toBe(true);

      // Đảo lại từ true -> false
      state = assignmentsReducer(state, toggleAssignment('test-1'));
      expect(state.items[0].isCompleted).toBe(false);
    });

    it('toggleAssignment: xử lý trường hợp biên khi id không tồn tại trong danh sách', () => {
      const prevState = {
        items: [
          {
            id: 'test-1',
            course: 'LTWNC',
            title: 'Bài thực hành',
            dueDate: '2026-10-15',
            priority: 'medium' as const,
            isCompleted: false,
            createdAt: '2026-10-13'
          }
        ],
        status: 'succeeded' as const,
        error: null
      };

      const state = assignmentsReducer(prevState, toggleAssignment('non-existent-id'));
      expect(state.items[0].isCompleted).toBe(false);
    });

    it('deleteAssignment: xoá chính xác bài tập theo id', () => {
      const prevState = {
        items: [
          {
            id: 'del-1',
            course: 'LTWNC',
            title: 'Bài 1',
            dueDate: '2026-10-15',
            priority: 'low' as const,
            isCompleted: false,
            createdAt: '2026-10-13'
          },
          {
            id: 'del-2',
            course: 'CSDL',
            title: 'Bài 2',
            dueDate: '2026-10-16',
            priority: 'high' as const,
            isCompleted: false,
            createdAt: '2026-10-13'
          }
        ],
        status: 'succeeded' as const,
        error: null
      };

      const state = assignmentsReducer(prevState, deleteAssignment('del-1'));
      expect(state.items).toHaveLength(1);
      expect(state.items[0].id).toBe('del-2');
    });

    it('deleteAssignment: xử lý trường hợp biên khi xoá id không tồn tại', () => {
      const prevState = {
        items: [
          {
            id: 'del-1',
            course: 'LTWNC',
            title: 'Bài 1',
            dueDate: '2026-10-15',
            priority: 'low' as const,
            isCompleted: false,
            createdAt: '2026-10-13'
          }
        ],
        status: 'succeeded' as const,
        error: null
      };

      const state = assignmentsReducer(prevState, deleteAssignment('missing-id'));
      expect(state.items).toHaveLength(1);
    });

    it('loadBulkAssignments: nạp nhanh hàng nghìn bài tập cho stress test', () => {
      const prevState = { items: [], status: 'idle' as const, error: null };
      const bulkData = Array.from({ length: 50 }, (_, i) => ({
        id: `bulk-${i}`,
        course: 'Môn học mẫu',
        title: `Bài tập #${i}`,
        dueDate: '2026-10-25',
        priority: 'medium' as const,
        isCompleted: false,
        createdAt: new Date().toISOString()
      }));

      const state = assignmentsReducer(prevState, loadBulkAssignments(bulkData));
      expect(state.items).toHaveLength(50);
      expect(state.status).toBe('succeeded');
    });

    it('resetAssignments: đặt lại danh sách mẫu mặc định', () => {
      const prevState = {
        items: [],
        status: 'failed' as const,
        error: 'Có lỗi xảy ra'
      };

      const state = assignmentsReducer(prevState, resetAssignments());
      expect(state.items.length).toBeGreaterThan(0);
      expect(state.status).toBe('succeeded');
      expect(state.error).toBeNull();
    });

    it('extraReducers: xử lý các trạng thái của fetchInitialAssignments', () => {
      // Pending
      let state = assignmentsReducer(
        initialState,
        fetchInitialAssignments.pending('req-1')
      );
      expect(state.status).toBe('loading');
      expect(state.error).toBeNull();

      // Fulfilled
      const mockPayload = {
        data: [
          {
            id: 'async-1',
            course: 'LTWNC',
            title: 'Thực hành',
            dueDate: '2026-10-20',
            priority: 'low' as const,
            isCompleted: false,
            createdAt: '2026-10-13'
          }
        ],
        status: 200,
        message: 'Thành công',
        timestamp: ''
      };
      state = assignmentsReducer(
        state,
        fetchInitialAssignments.fulfilled(mockPayload, 'req-1')
      );
      expect(state.status).toBe('succeeded');
      expect(state.items).toHaveLength(1);

      // Rejected
      state = assignmentsReducer(
        state,
        fetchInitialAssignments.rejected(new Error('Lỗi mạng giả lập'), 'req-1')
      );
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Lỗi mạng giả lập');
    });

    it('fetchInitialAssignments thunk: dispatch và gọi mock API thành công', async () => {
      const store = setupTestStore();
      await store.dispatch(fetchInitialAssignments());
      const state = store.getState();
      expect(state.assignments.status).toBe('succeeded');
      expect(state.assignments.items.length).toBeGreaterThan(0);
    });
  });
});
