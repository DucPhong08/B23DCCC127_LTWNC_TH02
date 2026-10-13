import React, { useMemo } from 'react';
import type { Assignment } from '../types';
import { calcStats } from '../types';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  BookOpen,
  PieChart,
  Award
} from 'lucide-react';

export interface AssignmentStatsProps {
  items: Assignment[];
  onClose?: () => void;
}

export const AssignmentStats: React.FC<AssignmentStatsProps> = ({ items, onClose }) => {
  // Tính toán số liệu thống kê qua helper calcStats
  const stats = useMemo(() => calcStats(items), [items]);

  const coursesList = Object.entries(stats.byCourse);

  return (
    <div className="stats-dashboard-card" data-testid="assignment-stats-view">
      <div className="stats-header">
        <div className="stats-header-title">
          <PieChart className="text-primary" size={24} />
          <div>
            <h2>Bảng Thống kê & Phân tích Tiến độ</h2>
            <p className="stats-subtitle">
              Được tải động qua <strong>React.lazy</strong> &amp; <strong>Suspense</strong> (Kỹ thuật Code-Splitting)
            </p>
          </div>
        </div>

        {onClose && (
          <button type="button" className="btn-close-stats" onClick={onClose}>
            Đóng
          </button>
        )}
      </div>

      {/* Grid thẻ số liệu tổng quan */}
      <div className="stats-metric-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Tổng số bài</span>
            <Layers size={18} className="text-secondary" />
          </div>
          <div className="stat-card-value">{stats.total.toLocaleString('vi-VN')}</div>
          <div className="stat-card-sub">Tổng bài tập cần xử lý</div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-card-header">
            <span className="stat-card-label">Đã hoàn thành</span>
            <CheckCircle2 size={18} style={{ color: '#16a34a' }} />
          </div>
          <div className="stat-card-value text-success">{stats.completed.toLocaleString('vi-VN')}</div>
          <div className="stat-card-sub">
            Tỉ lệ hoàn thành: <strong>{stats.completionRate}%</strong>
          </div>
        </div>

        <div className="stat-card stat-card-danger">
          <div className="stat-card-header">
            <span className="stat-card-label">Đã quá hạn</span>
            <AlertTriangle size={18} style={{ color: '#dc2626' }} />
          </div>
          <div className="stat-card-value text-danger">{stats.overdue.toLocaleString('vi-VN')}</div>
          <div className="stat-card-sub">Cần giải quyết ngay</div>
        </div>

        <div className="stat-card stat-card-info">
          <div className="stat-card-header">
            <span className="stat-card-label">Đang thực hiện</span>
            <Clock size={18} style={{ color: '#2563eb' }} />
          </div>
          <div className="stat-card-value text-primary">{stats.active.toLocaleString('vi-VN')}</div>
          <div className="stat-card-sub">Còn trong hạn nộp</div>
        </div>
      </div>

      {/* Thanh tiến độ tổng thể */}
      <div className="progress-section">
        <div className="progress-label-row">
          <span>Tiến độ hoàn thành bài tập tổng thể</span>
          <strong>{stats.completionRate}%</strong>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${stats.completionRate}%` }}
            role="progressbar"
            aria-valuenow={stats.completionRate}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Thống kê chi tiết theo từng môn học */}
      <div className="course-breakdown-section">
        <div className="section-title-row">
          <BookOpen size={18} />
          <h3>Thống kê phân bổ theo môn học ({coursesList.length} môn)</h3>
        </div>

        <div className="course-stats-table-wrapper">
          <table className="course-stats-table">
            <thead>
              <tr>
                <th>Tên môn học</th>
                <th>Tổng số bài</th>
                <th>Đã xong</th>
                <th>Quá hạn</th>
                <th>Tiến độ</th>
              </tr>
            </thead>
            <tbody>
              {coursesList.map(([courseName, courseStat]) => {
                const percent =
                  courseStat.total > 0
                    ? Math.round((courseStat.completed / courseStat.total) * 100)
                    : 0;
                return (
                  <tr key={courseName}>
                    <td className="course-name-cell">
                      <strong>{courseName}</strong>
                    </td>
                    <td>{courseStat.total.toLocaleString('vi-VN')}</td>
                    <td className="text-success">{courseStat.completed.toLocaleString('vi-VN')}</td>
                    <td className={courseStat.overdue > 0 ? 'text-danger' : ''}>
                      {courseStat.overdue.toLocaleString('vi-VN')}
                    </td>
                    <td>
                      <div className="mini-progress-wrapper">
                        <div className="mini-progress-track">
                          <div
                            className="mini-progress-fill"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="mini-percent">{percent}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Phân bổ theo mức độ ưu tiên */}
      <div className="priority-breakdown-section">
        <div className="section-title-row">
          <Award size={18} />
          <h3>Phân bổ theo mức độ ưu tiên</h3>
        </div>

        <div className="priority-pills-row">
          <div className="priority-pill pill-high">
            <span>Khẩn cấp:</span>
            <strong>{stats.byPriority.high.toLocaleString('vi-VN')} bài</strong>
          </div>
          <div className="priority-pill pill-medium">
            <span>Trung bình:</span>
            <strong>{stats.byPriority.medium.toLocaleString('vi-VN')} bài</strong>
          </div>
          <div className="priority-pill pill-low">
            <span>Thấp:</span>
            <strong>{stats.byPriority.low.toLocaleString('vi-VN')} bài</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentStats;
