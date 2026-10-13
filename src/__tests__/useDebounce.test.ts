import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../hooks/useDebounce';

describe('Hook Test: useDebounce bằng renderHook và fake timers (Yêu cầu Phần C)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('1. Trả về giá trị ban đầu ngay lập tức khi hook được khởi tạo', () => {
    const { result } = renderHook(() => useDebounce('khởi tạo', 300));
    expect(result.current).toBe('khởi tạo');
  });

  it('2. Không cập nhật giá trị mới trước khi hết khoảng thời gian delay 300ms', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'giá trị cũ', delay: 300 }
      }
    );

    rerender({ value: 'giá trị mới', delay: 300 });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current).toBe('giá trị cũ');
  });

  it('3. Cập nhật chính xác giá trị mới sau khi trôi qua đủ thời gian delay 300ms', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'lập trình', delay: 300 }
      }
    );

    rerender({ value: 'lập trình web nâng cao', delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('lập trình web nâng cao');
  });

  it('4. Huỷ bỏ timer cũ và chỉ cập nhật giá trị cuối cùng khi giá trị thay đổi liên tục (typing)', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      {
        initialProps: { value: 'a' }
      }
    );

    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ value: 'ab' });
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ value: 'abc' });
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('abc');
  });

  it('5. Hoạt động chính xác với thời gian delay tuỳ chỉnh (500ms)', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'start', delay: 500 }
      }
    );

    rerender({ value: 'end', delay: 500 });

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe('start');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('end');
  });
});
