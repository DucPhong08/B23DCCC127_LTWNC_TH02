import { useState, useMemo } from 'react';
import type { Assignment, FilterStatus } from '../types';
import { isOverdue } from '../types';
import { useDebounce } from '../../../hooks/useDebounce';

export interface FilterCounts {
  all: number;
  active: number;
  overdue: number;
  completed: number;
}

export function useAssignmentFilter(items: Assignment[], pinnedIds: string[] = []) {
  const [filter, setFilter] = useState<FilterStatus>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Kỹ thuật 2: useDebounce (300ms) cho ô tìm kiếm
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // useMemo cho thống kê số lượng bài theo từng tab lọc
  const counts: FilterCounts = useMemo(() => {
    let active = 0;
    let overdue = 0;
    let completed = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.isCompleted) {
        completed++;
      } else if (isOverdue(item.dueDate, item.isCompleted)) {
        overdue++;
      } else {
        active++;
      }
    }

    return {
      all: items.length,
      active,
      overdue,
      completed
    };
  }, [items]);

  // Kỹ thuật 2 (tiếp): useMemo cho phần lọc & sắp xếp theo bài đã ghim
  const filteredItems = useMemo(() => {
    const query = debouncedSearchTerm.trim().toLowerCase();
    const pinnedSet = new Set(pinnedIds);

    // 1. Lọc theo trạng thái và từ khóa tìm kiếm
    const filtered = items.filter((item) => {
      // Lọc theo trạng thái
      if (filter === 'ACTIVE') {
        if (item.isCompleted || isOverdue(item.dueDate, item.isCompleted)) return false;
      } else if (filter === 'OVERDUE') {
        if (item.isCompleted || !isOverdue(item.dueDate, item.isCompleted)) return false;
      } else if (filter === 'COMPLETED') {
        if (!item.isCompleted) return false;
      }

      // Lọc theo từ khóa tìm kiếm
      if (query) {
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchCourse = item.course.toLowerCase().includes(query);
        if (!matchTitle && !matchCourse) return false;
      }

      return true;
    });

    // 2. Sắp xếp: "Bài tập đã ghim luôn hiện lên đầu danh sách"
    // Nếu có bài ghim, tách ra hoặc sort với pinned lên trước
    if (pinnedSet.size === 0) {
      return filtered;
    }

    const pinnedList: Assignment[] = [];
    const regularList: Assignment[] = [];

    for (let i = 0; i < filtered.length; i++) {
      const item = filtered[i];
      if (pinnedSet.has(item.id)) {
        pinnedList.push(item);
      } else {
        regularList.push(item);
      }
    }

    return [...pinnedList, ...regularList];
  }, [items, filter, debouncedSearchTerm, pinnedIds]);

  return {
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    filteredItems,
    counts,
    total: items.length
  };
}
