import { describe, it, expect, beforeEach } from 'vitest';
import { usePinStore } from '../features/pins/usePinStore';

describe('Zustand Test: usePinStore (Yêu cầu Phần A)', () => {
  beforeEach(() => {
    usePinStore.getState().clearPins();
  });

  it('1. Khởi tạo trạng thái với danh sách pinnedIds rỗng', () => {
    const { pinnedIds, isPinned } = usePinStore.getState();
    expect(pinnedIds).toEqual([]);
    expect(isPinned('task-1')).toBe(false);
  });

  it('2. togglePin thêm id vào danh sách ghim khi chưa tồn tại', () => {
    usePinStore.getState().togglePin('task-1');

    const state = usePinStore.getState();
    expect(state.pinnedIds).toContain('task-1');
    expect(state.isPinned('task-1')).toBe(true);
  });

  it('3. togglePin loại bỏ id khỏi danh sách ghim khi id đã được ghim trước đó', () => {
    usePinStore.getState().togglePin('task-1');
    expect(usePinStore.getState().isPinned('task-1')).toBe(true);

    usePinStore.getState().togglePin('task-1');
    expect(usePinStore.getState().pinnedIds).not.toContain('task-1');
    expect(usePinStore.getState().isPinned('task-1')).toBe(false);
  });

  it('4. Hỗ trợ ghim nhiều bài tập và đặt các bài mới ghim lên đầu mảng pinnedIds', () => {
    usePinStore.getState().togglePin('task-1');
    usePinStore.getState().togglePin('task-2');

    const state = usePinStore.getState();
    expect(state.pinnedIds).toEqual(['task-2', 'task-1']);
    expect(state.isPinned('task-1')).toBe(true);
    expect(state.isPinned('task-2')).toBe(true);
  });

  it('5. clearPins xoá sạch toàn bộ danh sách ghim', () => {
    usePinStore.getState().togglePin('task-1');
    usePinStore.getState().togglePin('task-2');
    expect(usePinStore.getState().pinnedIds).toHaveLength(2);

    usePinStore.getState().clearPins();
    expect(usePinStore.getState().pinnedIds).toEqual([]);
  });
});
