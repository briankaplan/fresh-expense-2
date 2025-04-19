import { useState, useEffect } from 'react';

export function useDebouncedSearch<T>(
  initialValue: T,
  delay: number = 300
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return [debouncedValue, setValue];
}
