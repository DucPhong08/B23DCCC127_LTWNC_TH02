export type Priority = 'low' | 'medium' | 'high';

export type FilterStatus = 'ALL' | 'ACTIVE' | 'OVERDUE' | 'COMPLETED';

export interface Assignment {
  id: string;
  course: string;
  title: string;
  dueDate: string;
  priority: Priority;
  isCompleted: boolean;
  createdAt: string;
}

export type Deadline = Assignment;

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: string;
}

export type CreateAssignmentDto = Omit<Assignment, 'id' | 'createdAt'>;
export type CreateDeadlineDto = CreateAssignmentDto;

export type PriorityDisplayMap = Record<Priority, { label: string; color: string }>;

export const PRIORITY_CONFIG: PriorityDisplayMap = {
  low: { label: 'Thấp', color: '#16a34a' },
  medium: { label: 'Trung bình', color: '#d97706' },
  high: { label: 'Khẩn cấp', color: '#dc2626' }
};

export interface CourseStat {
  total: number;
  completed: number;
  overdue: number;
}

export interface AssignmentStatsData {
  total: number;
  completed: number;
  overdue: number;
  active: number;
  completionRate: number;
  byCourse: Record<string, CourseStat>;
  byPriority: Record<Priority, number>;
}

export function isOverdue(dueDate: string, isCompleted: boolean = false): boolean {
  if (isCompleted) return false;
  if (!dueDate) return false;

  const due = new Date(dueDate);
  if (isNaN(due.getTime())) return false;

  due.setHours(23, 59, 59, 999);
  const now = new Date().getTime();
  return now > due.getTime();
}

export function calcDaysLeft(dueDateStr: string): number {
  if (!dueDateStr) return 0;
  const targetDate = new Date(dueDateStr);
  if (isNaN(targetDate.getTime())) return 0;

  targetDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const msDiff = targetDate.getTime() - today.getTime();
  return Math.round(msDiff / (1000 * 60 * 60 * 24));
}

export function calcStats(items: Assignment[]): AssignmentStatsData {
  let completed = 0;
  let overdue = 0;
  let active = 0;

  const byCourse: Record<string, CourseStat> = {};
  const byPriority: Record<Priority, number> = {
    low: 0,
    medium: 0,
    high: 0
  };

  for (const item of items) {
    const isItemOverdue = isOverdue(item.dueDate, item.isCompleted);

    if (item.isCompleted) {
      completed++;
    } else if (isItemOverdue) {
      overdue++;
    } else {
      active++;
    }

    if (item.priority in byPriority) {
      byPriority[item.priority]++;
    }

    const courseName = item.course.trim() || 'Chưa phân loại';
    if (!byCourse[courseName]) {
      byCourse[courseName] = { total: 0, completed: 0, overdue: 0 };
    }
    byCourse[courseName].total++;
    if (item.isCompleted) {
      byCourse[courseName].completed++;
    } else if (isItemOverdue) {
      byCourse[courseName].overdue++;
    }
  }

  const total = items.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    overdue,
    active,
    completionRate,
    byCourse,
    byPriority
  };
}

export function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && ['low', 'medium', 'high'].includes(value);
}

export function isAssignment(item: unknown): item is Assignment {
  if (typeof item !== 'object' || item === null) return false;
  const candidate = item as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.course === 'string' &&
    typeof candidate.dueDate === 'string' &&
    isPriority(candidate.priority) &&
    typeof candidate.isCompleted === 'boolean'
  );
}
