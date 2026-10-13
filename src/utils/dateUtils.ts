import { isOverdue, calcDaysLeft } from '../features/assignments/types';

export interface DueCalculationResult {
  text: string;
  isOverdue: boolean;
  daysDiff: number;
}

export { isOverdue, calcDaysLeft };

export function calculateDueStatus(dueDateStr: string, isCompleted: boolean): DueCalculationResult {
  if (isCompleted) {
    return {
      text: 'Đã hoàn thành',
      isOverdue: false,
      daysDiff: 0
    };
  }

  const daysDiff = calcDaysLeft(dueDateStr);
  const overdue = isOverdue(dueDateStr, isCompleted);

  if (daysDiff < 0 || overdue) {
    return {
      text: `Quá hạn ${Math.abs(daysDiff)} ngày`,
      isOverdue: true,
      daysDiff
    };
  }

  if (daysDiff === 0) {
    return {
      text: 'Hạn chót hôm nay',
      isOverdue: false,
      daysDiff: 0
    };
  }

  return {
    text: `Còn ${daysDiff} ngày`,
    isOverdue: false,
    daysDiff
  };
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}
