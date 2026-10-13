import React, { useEffect, useState, lazy, Suspense, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { fetchInitialAssignments, loadBulkAssignments, resetAssignments } from './features/assignments/assignmentsSlice';
import { usePinStore } from './features/pins/usePinStore';
import { useAssignmentFilter } from './features/assignments/hooks/useAssignmentFilter';
import { AssignmentForm } from './features/assignments/components/AssignmentForm';
import { AssignmentFilter } from './features/assignments/components/AssignmentFilter';
import { AssignmentList } from './features/assignments/components/AssignmentList';
import { useTheme } from './contexts/ThemeContext';
import { generateMockAssignments } from './utils/dataGenerator';
import {
  CheckSquare,
  Sun,
  Moon,
  Zap,
  RotateCcw,
  BarChart3,
  ListTodo,
  Sparkles
} from 'lucide-react';

// Kỹ thuật 4: React.lazy và Suspense cho trang Thống kê
const LazyAssignmentStats = lazy(
  () => import('./features/assignments/components/AssignmentStats')
);

// Loading Skeleton cho Suspense
const StatsLoadingFallback: React.FC = () => (
  <div className="stats-loading-skeleton" data-testid="stats-loading-fallback">
    <div className="skeleton-title" />
    <div className="skeleton-grid">
      <div className="skeleton-card" />
      <div className="skeleton-card" />
      <div className="skeleton-card" />
      <div className="skeleton-card" />
    </div>
    <div className="skeleton-table" />
  </div>
);

export const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.assignments);

  // Zustand usePinStore
  const pinnedIds = usePinStore((state) => state.pinnedIds);
  const clearPins = usePinStore((state) => state.clearPins);

  // Theme Context
  const { theme, toggleTheme } = useTheme();

  // Chuyển đổi giữa chế độ xem Danh sách và Thống kê
  const [activeView, setActiveView] = useState<'tracker' | 'stats'>('tracker');

  // Custom hook lọc, tìm kiếm (useDebounce 300ms) và sort theo pin
  const {
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    filteredItems,
    counts
  } = useAssignmentFilter(items, pinnedIds);

  // Tải dữ liệu ban đầu hoặc tự động kích hoạt stress test qua URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('stress') === '10k' || params.get('mode') === 'unoptimized' || params.get('mode') === 'optimized') {
        const mock10k = generateMockAssignments(10000);
        dispatch(loadBulkAssignments(mock10k));
        return;
      }
    }
    dispatch(fetchInitialAssignments());
  }, [dispatch]);

  // Stress test: Tạo 10.000 bài tập mẫu
  const handleGenerate10k = useCallback(() => {
    const mock10k = generateMockAssignments(10000);
    dispatch(loadBulkAssignments(mock10k));
  }, [dispatch]);

  // Đặt lại dữ liệu ban đầu
  const handleReset = useCallback(() => {
    clearPins();
    dispatch(resetAssignments());
  }, [dispatch, clearPins]);

  return (
    <div className={`app-container theme-${theme}`}>
      {/* Header */}
      <header className="app-header">
        <div className="header-top">
          <div className="brand-title">
            <div className="brand-icon">
              <CheckSquare size={26} />
            </div>
            <div>
              <div className="brand-headline">
                <h1>Student Deadline Tracker</h1>
                <span className="badge-version">N2 — TH02</span>
              </div>
              <p className="brand-subtitle">
                Zustand Pinning • Theme Context • Redux Logger • React-window Virtualization
              </p>
            </div>
          </div>

          <div className="header-actions-panel">
            {/* Thống kê nhanh trên Header */}
            <div className="header-stats">
              <div className="stat-pill" title="Tổng số bài tập hiện tại">
                <span>Tổng bài:</span>
                <strong>{counts.all.toLocaleString('vi-VN')}</strong>
              </div>
              <div className="stat-pill" title="Bài tập chưa hoàn thành và còn hạn">
                <span>Chưa xong:</span>
                <strong style={{ color: '#2563eb' }}>{counts.active.toLocaleString('vi-VN')}</strong>
              </div>
              <div className="stat-pill" title="Bài tập đã quá hạn nộp">
                <span>Quá hạn:</span>
                <strong style={{ color: '#dc2626' }}>{counts.overdue.toLocaleString('vi-VN')}</strong>
              </div>
              <div className="stat-pill" title="Bài tập đã hoàn thành">
                <span>Hoàn thành:</span>
                <strong style={{ color: '#16a34a' }}>{counts.completed.toLocaleString('vi-VN')}</strong>
              </div>
            </div>

            {/* Nút chuyển đổi Theme Sáng / Tối */}
            <button
              type="button"
              className="btn-theme-toggle"
              onClick={toggleTheme}
              title={`Chuyển sang chế độ ${theme === 'light' ? 'Tối (Dark)' : 'Sáng (Light)'}`}
              aria-label="Đổi giao diện Sáng / Tối"
              data-testid="btn-theme-toggle"
            >
              {theme === 'light' ? (
                <>
                  <Moon size={17} />
                  <span>Tối</span>
                </>
              ) : (
                <>
                  <Sun size={17} />
                  <span>Sáng</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Bar phụ: Stress test & Chuyển View Tracker / Thống kê */}
        <div className="header-toolbar">
          <div className="view-switch-tabs">
            <button
              type="button"
              className={`view-tab-btn ${activeView === 'tracker' ? 'is-active' : ''}`}
              onClick={() => setActiveView('tracker')}
              data-testid="tab-view-tracker"
            >
              <ListTodo size={16} />
              <span>Danh sách Deadline</span>
            </button>
            <button
              type="button"
              className={`view-tab-btn ${activeView === 'stats' ? 'is-active' : ''}`}
              onClick={() => setActiveView('stats')}
              data-testid="tab-view-stats"
            >
              <BarChart3 size={16} />
              <span>Thống kê chi tiết (Lazy)</span>
            </button>
          </div>

          <div className="stress-test-actions">
            <button
              type="button"
              className="btn-stress-test"
              onClick={handleGenerate10k}
              title="Tạo nhanh 10.000 bài tập mẫu để kiểm thử hiệu năng và Virtualization"
              data-testid="btn-generate-10k"
            >
              <Zap size={16} />
              <span>Tạo 10.000 bài tập mẫu</span>
            </button>
            <button
              type="button"
              className="btn-reset-data"
              onClick={handleReset}
              title="Đặt lại dữ liệu về 3 bài tập ban đầu"
              data-testid="btn-reset-data"
            >
              <RotateCcw size={15} />
              <span>Đặt lại mặc định</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-layout">
        {activeView === 'tracker' ? (
          <>
            <aside className="sidebar-form">
              <AssignmentForm />
              {pinnedIds.length > 0 && (
                <div className="pinned-summary-card">
                  <Sparkles size={16} className="text-warning" />
                  <span>
                    Đang ghim <strong>{pinnedIds.length}</strong> bài tập lên đầu danh sách.
                  </span>
                </div>
              )}
            </aside>

            <section className="content-area">
              <AssignmentFilter
                currentFilter={filter}
                onFilterChange={setFilter}
                counts={counts}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                debouncedSearchTerm={debouncedSearchTerm}
              />

              <AssignmentList
                items={filteredItems}
                status={status}
                error={error}
              />
            </section>
          </>
        ) : (
          <section className="stats-full-section">
            <Suspense fallback={<StatsLoadingFallback />}>
              <LazyAssignmentStats
                items={items}
                onClose={() => setActiveView('tracker')}
              />
            </Suspense>
          </section>
        )}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;
