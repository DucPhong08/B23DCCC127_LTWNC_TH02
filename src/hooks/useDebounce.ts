import { useState, useEffect } from 'react';

/**
 * Custom Hook useDebounce hoãn cập nhật giá trị trong một khoảng thời gian trễ nhất định.
 * @param value Giá trị cần hoãn
 * @param delay Thời gian chờ (mặc định 300ms)
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
