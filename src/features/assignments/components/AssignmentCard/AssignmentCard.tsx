import React from 'react';
import type { Assignment } from '../../types';
import { PRIORITY_CONFIG } from '../../types';
import { calculateDueStatus, formatDisplayDate } from '../../../../utils/dateUtils';
import { BookOpen, Calendar, Check, RotateCcw, Trash2, Pin, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface AssignmentCardProps {
  item: Assignment;
  isPinned?: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
}

const AssignmentCardComponent: React.FC<AssignmentCardProps> = ({
  item,
  isPinned = false,
  onToggle,
  onDelete,
  onTogglePin
}) => {
  const priorityConfig = PRIORITY_CONFIG[item.priority] ?? PRIORITY_CONFIG.medium;
  const dueStatus = calculateDueStatus(item.dueDate, item.isCompleted);

  return (
    <article
      className={`assignment-card deadline-card ${item.isCompleted ? 'is-completed' : ''} ${
        isPinned ? 'is-pinned-card' : ''
      }`}
      data-testid={`assignment-card-${item.id}`}
    >
      {isPinned && <div className="pinned-indicator-bar" title="Đã ghim lên đầu danh sách" />}

      <header className="card-header">
        <div className="course-tag">
          <BookOpen size={14} />
          <span>{item.course}</span>
        </div>

        <div className="header-badges">
          <span
            className="priority-badge"
            style={{
              color: priorityConfig.color,
              backgroundColor: `${priorityConfig.color}18`,
              borderColor: `${priorityConfig.color}40`
            }}
          >
            {priorityConfig.label}
          </span>

          <button
            type="button"
            className={`btn-pin ${isPinned ? 'is-active-pin' : ''}`}
            onClick={() => onTogglePin(item.id)}
            aria-label={isPinned ? 'Bỏ ghim bài tập' : 'Ghim bài tập'}
            title={isPinned ? 'Bỏ ghim bài tập' : 'Ghim lên đầu danh sách'}
            data-testid={`btn-pin-${item.id}`}
          >
            <Pin size={15} className={isPinned ? 'fill-current' : ''} />
            <span className="sr-only">{isPinned ? 'Bỏ ghim' : 'Ghim'}</span>
          </button>
        </div>
      </header>

      <div className="card-content">
        <h3 className={`card-title ${item.isCompleted ? 'completed-text' : ''}`}>
          {item.title}
        </h3>
        <div className="due-date-meta">
          <Calendar size={14} />
          <span>Hạn nộp: {formatDisplayDate(item.dueDate)}</span>
        </div>
      </div>

      <footer className="card-footer">
        <div className="card-due-badge">
          {item.isCompleted ? (
            <div className="status-badge status-completed">
              <CheckCircle2 size={13} />
              <span>Đã hoàn thành</span>
            </div>
          ) : dueStatus.isOverdue ? (
            <div className="status-badge status-overdue">
              <AlertTriangle size={13} />
              <span>{dueStatus.text}</span>
            </div>
          ) : (
            <div
              className={`status-badge ${
                dueStatus.daysDiff === 0 ? 'status-today' : 'status-pending'
              }`}
            >
              <Clock size={13} />
              <span>{dueStatus.text}</span>
            </div>
          )}
        </div>

        <div className="card-actions">
          <button
            type="button"
            className={`btn-toggle ${item.isCompleted ? 'btn-toggle-reopen' : 'btn-toggle-complete'}`}
            onClick={() => onToggle(item.id)}
            title={item.isCompleted ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
            aria-label={item.isCompleted ? 'Làm lại bài tập' : 'Hoàn thành bài tập'}
            data-testid={`btn-toggle-${item.id}`}
          >
            {item.isCompleted ? (
              <>
                <RotateCcw size={15} />
                <span>Làm lại</span>
              </>
            ) : (
              <>
                <Check size={15} />
                <span>Hoàn thành</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="btn-delete"
            onClick={() => onDelete(item.id)}
            title="Xoá bài tập này"
            aria-label="Xoá bài tập"
            data-testid={`btn-delete-${item.id}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </footer>
    </article>
  );
};

export const AssignmentCard = React.memo(AssignmentCardComponent);
export default AssignmentCard;
