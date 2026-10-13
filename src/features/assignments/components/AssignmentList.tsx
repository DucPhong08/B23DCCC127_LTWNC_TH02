import React, { useCallback, useState } from 'react';
import type { Assignment } from '../types';
import { AssignmentCard } from './AssignmentCard';
import { usePinStore } from '../../pins/usePinStore';
import { useAppDispatch } from '../../../app/hooks';
import { toggleAssignment, deleteAssignment } from '../assignmentsSlice';
import { FixedSizeList, type ListChildComponentProps } from 'react-window';
import { Inbox, AlertCircle, Zap, LayoutGrid } from 'lucide-react';

export interface AssignmentListProps {
  items: Assignment[];
  status?: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string | null;
  enableVirtualizationDefault?: boolean;
}

export const AssignmentList: React.FC<AssignmentListProps> = ({
  items,
  status = 'succeeded',
  error = null,
  enableVirtualizationDefault = true
}) => {
  const dispatch = useAppDispatch();
  const pinnedIds = usePinStore((state) => state.pinnedIds);
  const togglePin = usePinStore((state) => state.togglePin);

  const [isVirtualized, setIsVirtualized] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'unoptimized') return false;
      if (params.get('mode') === 'optimized') return true;
    }
    return items.length > 50 || enableVirtualizationDefault;
  });

  const handleToggle = useCallback(
    (id: string) => {
      dispatch(toggleAssignment(id));
    },
    [dispatch]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (window.confirm('Bạn có chắc chắn muốn xoá bài tập này?')) {
        dispatch(deleteAssignment(id));
      }
    },
    [dispatch]
  );

  const handleTogglePin = useCallback(
    (id: string) => {
      togglePin(id);
    },
    [togglePin]
  );

  if (status === 'loading') {
    return (
      <div className="loading-box" data-testid="assignment-loading-state">
        <div className="spinner" />
        <p>Đang tải danh sách bài tập từ mock API...</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="form-error-banner error-state-box" data-testid="assignment-error-state">
        <AlertCircle size={20} />
        <span>{error ?? 'Đã xảy ra lỗi khi tải danh sách bài tập!'}</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="empty-state-card" data-testid="assignment-empty-state">
        <Inbox size={48} className="empty-icon" />
        <h3>Không có bài tập nào</h3>
        <p>Không tìm thấy bài tập nào phù hợp với bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
      </div>
    );
  }

  const VirtualRow: React.FC<ListChildComponentProps> = ({ index, style }) => {
    const item = items[index];
    const isPinned = pinnedIds.includes(item.id);

    return (
      <div style={{ ...style, paddingBottom: 16, boxSizing: 'border-box' }}>
        <AssignmentCard
          item={item}
          isPinned={isPinned}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onTogglePin={handleTogglePin}
        />
      </div>
    );
  };

  return (
    <div className="assignment-list-container" data-testid="assignment-list-container">
      <div className="list-toolbar">
        <span className="list-count-info">
          Hiển thị <strong>{items.length.toLocaleString('vi-VN')}</strong> bài tập
          {items.length >= 1000 && (
            <span className="stress-badge">⚡ Chế độ Stress Test 10.000 bài</span>
          )}
        </span>

        {items.length > 20 && (
          <button
            type="button"
            className={`virtualize-toggle-btn ${isVirtualized ? 'active' : ''}`}
            onClick={() => setIsVirtualized(!isVirtualized)}
            title="Bật/Tắt Virtualization (react-window) để kiểm tra hiệu năng trước/sau"
          >
            {isVirtualized ? (
              <>
                <Zap size={14} className="text-yellow" />
                <span>Virtualization: BẬT</span>
              </>
            ) : (
              <>
                <LayoutGrid size={14} />
                <span>Virtualization: TẮT (Render toàn bộ DOM)</span>
              </>
            )}
          </button>
        )}
      </div>

      {isVirtualized && items.length > 20 ? (
        <div className="virtualized-list-wrapper" data-testid="virtualized-list">
          <FixedSizeList
            height={680}
            itemCount={items.length}
            itemSize={196}
            width="100%"
            overscanCount={4}
          >
            {VirtualRow}
          </FixedSizeList>
        </div>
      ) : (
        <div className="assignment-grid deadline-grid" data-testid="standard-list">
          {items.map((item) => (
            <AssignmentCard
              key={item.id}
              item={item}
              isPinned={pinnedIds.includes(item.id)}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onTogglePin={handleTogglePin}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentList;
