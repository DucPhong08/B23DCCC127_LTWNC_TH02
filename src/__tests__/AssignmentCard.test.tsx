import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssignmentCard } from '../features/assignments/components/AssignmentCard';
import type { Assignment } from '../features/assignments/types';

describe('Component Test: AssignmentCard (RTL + userEvent)', () => {
  const mockAssignment: Assignment = {
    id: 'asg-test-1',
    course: 'Lập trình Web nâng cao',
    title: 'Nâng cấp Student Deadline Tracker',
    dueDate: '2026-10-25',
    priority: 'high',
    isCompleted: false,
    createdAt: '2026-10-13T10:00:00.000Z'
  };

  it('1. Hiển thị chính xác thông tin bài tập (môn học, tiêu đề, độ ưu tiên, hạn nộp)', () => {
    const onToggle = vi.fn();
    const onDelete = vi.fn();
    const onTogglePin = vi.fn();

    render(
      <AssignmentCard
        item={mockAssignment}
        isPinned={false}
        onToggle={onToggle}
        onDelete={onDelete}
        onTogglePin={onTogglePin}
      />
    );

    expect(screen.getByText('Lập trình Web nâng cao')).toBeInTheDocument();
    expect(screen.getByText('Nâng cấp Student Deadline Tracker')).toBeInTheDocument();

    expect(screen.getByText('Khẩn cấp')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /hoàn thành bài tập/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ghim bài tập/i })).toBeInTheDocument();
  });

  it('2. Nhấp nút "Hoàn thành" kích hoạt callback onToggle với đúng ID', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onDelete = vi.fn();
    const onTogglePin = vi.fn();

    render(
      <AssignmentCard
        item={mockAssignment}
        isPinned={false}
        onToggle={onToggle}
        onDelete={onDelete}
        onTogglePin={onTogglePin}
      />
    );

    const toggleBtn = screen.getByRole('button', { name: /hoàn thành bài tập/i });
    await user.click(toggleBtn);

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith('asg-test-1');
  });

  it('3. Hiển thị trạng thái "Làm lại" khi bài tập đã hoàn thành và kích hoạt onToggle khi bấm', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onDelete = vi.fn();
    const onTogglePin = vi.fn();

    const completedAssignment: Assignment = {
      ...mockAssignment,
      isCompleted: true
    };

    render(
      <AssignmentCard
        item={completedAssignment}
        isPinned={false}
        onToggle={onToggle}
        onDelete={onDelete}
        onTogglePin={onTogglePin}
      />
    );

    expect(screen.getByText('Đã hoàn thành')).toBeInTheDocument();

    const reopenBtn = screen.getByRole('button', { name: /làm lại bài tập/i });
    expect(reopenBtn).toBeInTheDocument();

    await user.click(reopenBtn);
    expect(onToggle).toHaveBeenCalledWith('asg-test-1');
  });

  it('4. Nhấp nút Ghim kích hoạt callback onTogglePin với đúng ID và hiển thị visual khi ghim', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onDelete = vi.fn();
    const onTogglePin = vi.fn();

    const { rerender } = render(
      <AssignmentCard
        item={mockAssignment}
        isPinned={false}
        onToggle={onToggle}
        onDelete={onDelete}
        onTogglePin={onTogglePin}
      />
    );

    const pinBtn = screen.getByRole('button', { name: /ghim bài tập/i });
    await user.click(pinBtn);

    expect(onTogglePin).toHaveBeenCalledTimes(1);
    expect(onTogglePin).toHaveBeenCalledWith('asg-test-1');

    rerender(
      <AssignmentCard
        item={mockAssignment}
        isPinned={true}
        onToggle={onToggle}
        onDelete={onDelete}
        onTogglePin={onTogglePin}
      />
    );

    const unpinBtn = screen.getByRole('button', { name: /bỏ ghim bài tập/i });
    expect(unpinBtn).toBeInTheDocument();

    const cardElement = screen.getByTestId('assignment-card-asg-test-1');
    expect(cardElement).toHaveClass('is-pinned-card');
  });

  it('5. Nhấp nút Xoá kích hoạt callback onDelete', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onDelete = vi.fn();
    const onTogglePin = vi.fn();

    render(
      <AssignmentCard
        item={mockAssignment}
        isPinned={false}
        onToggle={onToggle}
        onDelete={onDelete}
        onTogglePin={onTogglePin}
      />
    );

    const deleteBtn = screen.getByRole('button', { name: /xoá bài tập/i });
    await user.click(deleteBtn);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith('asg-test-1');
  });
});
