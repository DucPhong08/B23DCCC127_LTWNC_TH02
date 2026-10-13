import React from 'react';
import type { FilterStatus } from '../types';
import type { FilterCounts } from '../hooks/useAssignmentFilter';
import { Layers, Clock, AlertTriangle, CheckCircle, Search, X } from 'lucide-react';

export interface AssignmentFilterProps {
  currentFilter: FilterStatus;
  onFilterChange: (status: FilterStatus) => void;
  counts: FilterCounts;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  debouncedSearchTerm?: string;
}

export const AssignmentFilter: React.FC<AssignmentFilterProps> = ({
  currentFilter,
  onFilterChange,
  counts,
  searchTerm,
  onSearchChange,
  debouncedSearchTerm = ''
}) => {
  const tabs: { key: FilterStatus; label: string; count: number; icon: React.ReactNode }[] = [
    {
      key: 'ALL',
      label: 'Tất cả',
      count: counts.all,
      icon: <Layers size={16} />
    },
    {
      key: 'ACTIVE',
      label: 'Chưa hoàn thành',
      count: counts.active,
      icon: <Clock size={16} />
    },
    {
      key: 'OVERDUE',
      label: 'Quá hạn',
      count: counts.overdue,
      icon: <AlertTriangle size={16} />
    },
    {
      key: 'COMPLETED',
      label: 'Đã hoàn thành',
      count: counts.completed,
      icon: <CheckCircle size={16} />
    }
  ];

  return (
    <div className="filter-controls-container">
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm bài tập theo tên môn học hoặc tiêu đề... (debounce 300ms)"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Tìm kiếm bài tập"
          data-testid="search-input"
        />
        {searchTerm && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => onSearchChange('')}
            aria-label="Xoá tìm kiếm"
          >
            <X size={15} />
          </button>
        )}
        {searchTerm !== debouncedSearchTerm && (
          <span className="debouncing-indicator" title="Đang chờ debounce 300ms...">
            Đang gõ...
          </span>
        )}
      </div>

      <div className="filter-tabs-wrapper">
        <div className="filter-tabs" role="tablist">
          {tabs.map((tab) => {
            const isActive = currentFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`filter-tab-btn ${isActive ? 'is-active' : ''} ${
                  tab.key === 'OVERDUE' && tab.count > 0 ? 'has-overdue' : ''
                }`}
                onClick={() => onFilterChange(tab.key)}
                data-testid={`filter-tab-${tab.key.toLowerCase()}`}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
                <span className="tab-count-badge">{tab.count.toLocaleString('vi-VN')}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AssignmentFilter;
