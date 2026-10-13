import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/test-utils';
import { AssignmentForm } from '../features/assignments/components/AssignmentForm';

describe('Component Test: AssignmentForm (RTL + userEvent)', () => {
  it('1. Render đầy đủ các ô nhập liệu và nút submit', () => {
    renderWithProviders(<AssignmentForm />);

    expect(screen.getByLabelText(/môn học/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tên bài tập/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hạn nộp/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/độ ưu tiên/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /thêm bài tập/i })).toBeInTheDocument();
  });

  it('2. Validation: hiển thị thông báo lỗi khi submit form để trống các trường', async () => {
    const user = userEvent.setup();
    const onSubmitSuccess = vi.fn();

    renderWithProviders(<AssignmentForm onSubmitSuccess={onSubmitSuccess} />);

    const submitBtn = screen.getByRole('button', { name: /thêm bài tập/i });
    await user.click(submitBtn);

    // Kiểm tra thông báo lỗi xuất hiện
    const errorBanner = screen.getByRole('alert');
    expect(errorBanner).toBeInTheDocument();
    expect(errorBanner).toHaveTextContent('Vui lòng nhập đầy đủ môn học, tên bài tập và hạn nộp!');

    // Không được gọi callback submit thành công
    expect(onSubmitSuccess).not.toHaveBeenCalled();
  });

  it('3. Validation: vẫn báo lỗi khi chỉ nhập một phần thông tin bắt buộc', async () => {
    const user = userEvent.setup();
    const onSubmitSuccess = vi.fn();

    renderWithProviders(<AssignmentForm onSubmitSuccess={onSubmitSuccess} />);

    // Chỉ nhập môn học mà không nhập tên bài tập và hạn nộp
    const courseInput = screen.getByLabelText(/môn học/i);
    await user.type(courseInput, 'Lập trình Web');

    const submitBtn = screen.getByRole('button', { name: /thêm bài tập/i });
    await user.click(submitBtn);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(onSubmitSuccess).not.toHaveBeenCalled();
  });

  it('4. Submit thành công: thêm bài tập hợp lệ, gọi callback và xoá trắng form', async () => {
    const user = userEvent.setup();
    const onSubmitSuccess = vi.fn();

    const { store } = renderWithProviders(
      <AssignmentForm onSubmitSuccess={onSubmitSuccess} />
    );

    const courseInput = screen.getByLabelText(/môn học/i) as HTMLInputElement;
    const titleInput = screen.getByLabelText(/tên bài tập/i) as HTMLInputElement;
    const dueDateInput = screen.getByLabelText(/hạn nộp/i) as HTMLInputElement;
    const prioritySelect = screen.getByLabelText(/độ ưu tiên/i) as HTMLSelectElement;

    // Nhập dữ liệu hợp lệ
    await user.type(courseInput, 'Kiến trúc phần mềm');
    await user.type(titleInput, 'Thiết kế hệ thống Microservices');
    await user.type(dueDateInput, '2026-10-30');
    await user.selectOptions(prioritySelect, 'high');

    const submitBtn = screen.getByRole('button', { name: /thêm bài tập/i });
    await user.click(submitBtn);

    // Callback onSubmitSuccess được gọi
    expect(onSubmitSuccess).toHaveBeenCalledTimes(1);
    expect(onSubmitSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        course: 'Kiến trúc phần mềm',
        title: 'Thiết kế hệ thống Microservices',
        dueDate: '2026-10-30',
        priority: 'high',
        isCompleted: false
      })
    );

    // Kiểm tra state của store đã được thêm bài tập mới
    const state = store.getState();
    expect(state.assignments.items).toHaveLength(1);
    expect(state.assignments.items[0].title).toBe('Thiết kế hệ thống Microservices');

    // Form inputs đã được reset
    expect(courseInput.value).toBe('');
    expect(titleInput.value).toBe('');
    expect(dueDateInput.value).toBe('');

    // Không còn thông báo lỗi
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
