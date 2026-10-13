import React, { useState } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { addAssignment } from '../assignmentsSlice';
import type { CreateAssignmentDto, Priority } from '../types';
import { PlusCircle, Calendar, Tag, AlertCircle, BookOpen } from 'lucide-react';

export interface AssignmentFormProps {
  onSubmitSuccess?: (dto: CreateAssignmentDto) => void;
}

export const AssignmentForm: React.FC<AssignmentFormProps> = ({ onSubmitSuccess }) => {
  const dispatch = useAppDispatch();

  const [course, setCourse] = useState('');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!course.trim() || !title.trim() || !dueDate) {
      setError('Vui lòng nhập đầy đủ môn học, tên bài tập và hạn nộp!');
      return;
    }

    const payload: CreateAssignmentDto = {
      course: course.trim(),
      title: title.trim(),
      dueDate,
      priority,
      isCompleted: false
    };

    dispatch(addAssignment(payload));
    if (onSubmitSuccess) {
      onSubmitSuccess(payload);
    }

    // Reset form
    setCourse('');
    setTitle('');
    setDueDate('');
    setPriority('medium');
    setError(null);
  };

  return (
    <form className="deadline-form-card assignment-form-card" onSubmit={handleSubmit} data-testid="assignment-form">
      <div className="form-header">
        <PlusCircle size={20} className="text-primary" />
        <h2>Thêm bài tập mới</h2>
      </div>

      {error && (
        <div className="form-error-banner" data-testid="form-error-banner" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="course-input">
            <BookOpen size={15} />
            Môn học
          </label>
          <input
            id="course-input"
            name="course"
            type="text"
            placeholder="VD: Lập trình Web nâng cao"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="title-input">
            <Tag size={15} />
            Tên bài tập
          </label>
          <input
            id="title-input"
            name="title"
            type="text"
            placeholder="VD: Bài thực hành 02"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="due-date-input">
            <Calendar size={15} />
            Hạn nộp
          </label>
          <input
            id="due-date-input"
            name="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="priority-select">
            <AlertCircle size={15} />
            Độ ưu tiên
          </label>
          <select
            id="priority-select"
            name="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            <option value="low">Thấp (Xanh)</option>
            <option value="medium">Trung bình (Vàng)</option>
            <option value="high">Khẩn cấp (Đỏ)</option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit" data-testid="btn-submit-assignment">
          <PlusCircle size={16} />
          <span>Thêm Bài tập</span>
        </button>
      </div>
    </form>
  );
};

export default AssignmentForm;
