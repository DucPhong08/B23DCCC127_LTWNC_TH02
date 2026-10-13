import { describe, it, expect, vi } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/test-utils';
import { AssignmentFilter } from '../features/assignments/components/AssignmentFilter';
import { AssignmentStats } from '../features/assignments/components/AssignmentStats';
import { useAssignmentFilter } from '../features/assignments/hooks/useAssignmentFilter';
import { renderHook, act } from '@testing-library/react';
import type { Assignment } from '../features/assignments/types';

describe('Integration Tests: AssignmentFilter & AssignmentStats', () => {
  const sampleItems: Assignment[] = [
    {
      id: 'asg-1',
      course: 'Lập trình Web nâng cao',
      title: 'Bài thực hành 1',
      dueDate: '2026-10-25',
      priority: 'high',
      isCompleted: false,
      createdAt: '2026-10-13'
    },
    {
      id: 'asg-2',
      course: 'Kiến trúc phần mềm',
      title: 'Đồ án nhóm',
      dueDate: '2026-10-28',
      priority: 'medium',
      isCompleted: true,
      createdAt: '2026-10-13'
    },
    {
      id: 'asg-3',
      course: 'Cơ sở dữ liệu',
      title: 'Báo cáo B-Tree',
      dueDate: '2020-01-01', // Quá hạn
      priority: 'low',
      isCompleted: false,
      createdAt: '2026-10-13'
    }
  ];

  describe('useAssignmentFilter hook logic', () => {
    it('sắp xếp bài tập đã ghim luôn hiện lên đầu danh sách', () => {
      // Ghim bài asg-3 (vốn ở vị trí cuối)
      const { result } = renderHook(() =>
        useAssignmentFilter(sampleItems, ['asg-3'])
      );

      // asg-3 phải nhảy lên đầu danh sách
      expect(result.current.filteredItems[0].id).toBe('asg-3');
      expect(result.current.filteredItems[1].id).toBe('asg-1');
      expect(result.current.filteredItems[2].id).toBe('asg-2');
    });

    it('lọc chính xác theo tab trạng thái COMPLETED và OVERDUE', () => {
      const { result } = renderHook(() =>
        useAssignmentFilter(sampleItems, [])
      );

      // Chuyển sang COMPLETED
      act(() => {
        result.current.setFilter('COMPLETED');
      });
      expect(result.current.filteredItems).toHaveLength(1);
      expect(result.current.filteredItems[0].id).toBe('asg-2');

      // Chuyển sang OVERDUE
      act(() => {
        result.current.setFilter('OVERDUE');
      });
      expect(result.current.filteredItems).toHaveLength(1);
      expect(result.current.filteredItems[0].id).toBe('asg-3');
    });
  });

  describe('AssignmentFilter component UI', () => {
    it('gõ vào ô tìm kiếm gọi onSearchChange và click tab lọc gọi onFilterChange', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      const onSearchChange = vi.fn();

      const counts = { all: 3, active: 1, overdue: 1, completed: 1 };

      render(
        <AssignmentFilter
          currentFilter="ALL"
          onFilterChange={onFilterChange}
          counts={counts}
          searchTerm=""
          onSearchChange={onSearchChange}
        />
      );

      // Gõ vào ô tìm kiếm
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Web');
      expect(onSearchChange).toHaveBeenCalled();

      // Click tab "Đã hoàn thành"
      const completedTab = screen.getByTestId('filter-tab-completed');
      await user.click(completedTab);
      expect(onFilterChange).toHaveBeenCalledWith('COMPLETED');
    });
  });

  describe('AssignmentStats (Lazy Loaded Component)', () => {
    it('hiển thị đầy đủ các chỉ số thống kê, bảng môn học và nút đóng', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      renderWithProviders(
        <AssignmentStats items={sampleItems} onClose={onClose} />
      );

      expect(screen.getByTestId('assignment-stats-view')).toBeInTheDocument();
      expect(screen.getByText('Bảng Thống kê & Phân tích Tiến độ')).toBeInTheDocument();

      // Kiểm tra có hiển thị tên các môn học trong bảng
      expect(screen.getByText('Lập trình Web nâng cao')).toBeInTheDocument();
      expect(screen.getByText('Kiến trúc phần mềm')).toBeInTheDocument();
      expect(screen.getByText('Cơ sở dữ liệu')).toBeInTheDocument();

      // Click nút Đóng
      const closeBtn = screen.getByRole('button', { name: /đóng/i });
      await user.click(closeBtn);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
