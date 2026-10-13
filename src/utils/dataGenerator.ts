import type { Assignment, Priority } from '../features/assignments/types';

const COURSES = [
  'Lập trình Web nâng cao',
  'Kiến trúc phần mềm',
  'Cơ sở dữ liệu nâng cao',
  'Cấu trúc dữ liệu & Giải thuật',
  'Mạng máy tính',
  'Trí tuệ nhân tạo',
  'An toàn thông tin',
  'Hệ điều hành',
  'Lập trình di động',
  'Quản trị dự án CNTT'
];

const TASK_TEMPLATES = [
  'Bài tập lớn: Phát triển hệ thống quản lý',
  'Báo cáo thực hành phòng máy',
  'Thiết kế sơ đồ kiến trúc hệ thống',
  'Tối ưu hóa truy vấn cơ sở dữ liệu',
  'Xây dựng RESTful API và xác thực JWT',
  'Viết kiểm thử tự động với Jest và RTL',
  'Cài đặt mô hình Deep Learning phân loại',
  'Lập trình ứng dụng Web thời gian thực',
  'Phân tích an toàn bảo mật mạng',
  'Báo cáo tiến độ đề tài môn học'
];

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

export function generateMockAssignments(count: number = 10000): Assignment[] {
  const result: Assignment[] = new Array(count);
  const now = new Date();
  const baseTime = now.getTime();

  for (let i = 0; i < count; i++) {
    const courseIndex = i % COURSES.length;
    const taskIndex = (i * 3 + 1) % TASK_TEMPLATES.length;
    const priorityIndex = (i * 7) % PRIORITIES.length;

    let offsetDays: number;
    const mod = i % 10;
    if (mod < 2) {
      offsetDays = -((i % 15) + 1);
    } else if (mod === 2) {
      offsetDays = 0;
    } else {
      offsetDays = (i % 30) + 1;
    }

    const dueDateObj = new Date(baseTime + offsetDays * 24 * 60 * 60 * 1000);
    const dueDate = dueDateObj.toISOString().split('T')[0];

    const isCompleted = i % 3 === 0;

    result[i] = {
      id: `task-${i + 1}`,
      course: COURSES[courseIndex],
      title: `${TASK_TEMPLATES[taskIndex]} #${i + 1}`,
      dueDate,
      priority: PRIORITIES[priorityIndex],
      isCompleted,
      createdAt: new Date(baseTime - (i % 20) * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  return result;
}

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'dl-1',
    course: 'Lập trình Web nâng cao',
    title: 'Bài thực hành 02 - State Management, Tối ưu & Testing',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'high',
    isCompleted: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'dl-2',
    course: 'Kiến trúc phần mềm',
    title: 'Thiết kế sơ đồ Sequence & Class Diagram cho đồ án',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'medium',
    isCompleted: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'dl-3',
    course: 'Cơ sở dữ liệu nâng cao',
    title: 'Tối ưu hóa chỉ mục Index & Query Execution Plan B-Tree',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'low',
    isCompleted: true,
    createdAt: new Date().toISOString()
  }
];
