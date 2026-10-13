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

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const counts: FilterCounts = useMemo(() => {
    let active = 0;
    let overdue = 0;
    let completed = 0;

    for (const item of items) {
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

  const filteredItems = useMemo(() => {
    const query = debouncedSearchTerm.trim().toLowerCase();
    const pinnedSet = new Set(pinnedIds);

    const filtered = items.filter((item) => {
      if (filter === 'ACTIVE') {
        if (item.isCompleted || isOverdue(item.dueDate, item.isCompleted)) return false;
      } else if (filter === 'OVERDUE') {
        if (item.isCompleted || !isOverdue(item.dueDate, item.isCompleted)) return false;
      } else if (filter === 'COMPLETED') {
        if (!item.isCompleted) return false;
      }

      if (query) {
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchCourse = item.course.toLowerCase().includes(query);
        if (!matchTitle && !matchCourse) return false;
      }

      return true;
    });

    if (pinnedSet.size === 0) {
      return filtered;
    }

    const pinnedList: Assignment[] = [];
    const regularList: Assignment[] = [];

    for (const item of filtered) {
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
