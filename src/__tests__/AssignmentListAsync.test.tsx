import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/test-utils';
import { AssignmentList } from '../features/assignments/components/AssignmentList';
import type { Assignment } from '../features/assignments/types';

describe('Async Tests: AssignmentList với các trạng thái API Mock (Yêu cầu Phần C)', () => {
  const mockItems: Assignment[] = [
    {
      id: 'asg-async-1',
      course: 'Lập trình Web nâng cao',
      title: 'Bài tập 1: Redux Toolkit',
      dueDate: '2026-10-25',
      priority: 'high',
      isCompleted: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'asg-async-2',
      course: 'Cơ sở dữ liệu nâng cao',
      title: 'Bài tập 2: Query Tuning',
      dueDate: '2026-10-28',
      priority: 'medium',
      isCompleted: true,
      createdAt: new Date().toISOString()
    }
  ];

  it('1. Trạng thái Đang tải (Loading State): hiển thị spinner và thông điệp tải dữ liệu', () => {
    renderWithProviders(
      <AssignmentList
        items={[]}
        status="loading"
        error={null}
      />
    );

    const loadingBox = screen.getByTestId('assignment-loading-state');
    expect(loadingBox).toBeInTheDocument();
    expect(screen.getByText(/đang tải danh sách bài tập từ mock api/i)).toBeInTheDocument();

    // Không render danh sách thẻ bài tập khi đang tải
    expect(screen.queryByTestId('assignment-list-container')).not.toBeInTheDocument();
  });

  it('2. Trạng thái Thành công (Succeeded State): hiển thị danh sách các bài tập', () => {
    renderWithProviders(
      <AssignmentList
        items={mockItems}
        status="succeeded"
        error={null}
      />
    );

    expect(screen.getByTestId('assignment-list-container')).toBeInTheDocument();
    expect(screen.getByText('Bài tập 1: Redux Toolkit')).toBeInTheDocument();
    expect(screen.getByText('Bài tập 2: Query Tuning')).toBeInTheDocument();

    // Kiểm tra số lượng bài tập hiển thị trên thanh toolbar
    expect(screen.getByText(/hiển thị/i)).toBeInTheDocument();
  });

  it('3. Trạng thái Lỗi (Failed State): hiển thị banner thông báo lỗi từ mock API', () => {
    const errorMessage = 'Máy chủ mock API không phản hồi (500 Internal Server Error)';

    renderWithProviders(
      <AssignmentList
        items={[]}
        status="failed"
        error={errorMessage}
      />
    );

    const errorBox = screen.getByTestId('assignment-error-state');
    expect(errorBox).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();

    // Không render danh sách rỗng hay danh sách thành công
    expect(screen.queryByTestId('assignment-empty-state')).not.toBeInTheDocument();
  });

  it('4. Trạng thái Danh sách rỗng: hiển thị Empty State khi không có bài tập nào', () => {
    renderWithProviders(
      <AssignmentList
        items={[]}
        status="succeeded"
        error={null}
      />
    );

    const emptyBox = screen.getByTestId('assignment-empty-state');
    expect(emptyBox).toBeInTheDocument();
    expect(screen.getByText('Không có bài tập nào')).toBeInTheDocument();
  });
});
