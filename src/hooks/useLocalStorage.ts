import { useState, useEffect, useRef, useCallback } from 'react';

type Options<T> = {
  serialize?: (value: T) => string;
  deserialize?: (raw: string) => T;
};

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: Options<T>,
): [T, (value: T | ((prev: T) => T)) => void] {
  const serialize = options?.serialize ?? JSON.stringify;
  const deserialize = options?.deserialize ?? ((raw: string) => JSON.parse(raw) as T);
  const serializeRef = useRef(serialize);
  const deserializeRef = useRef(deserialize);
  const initialized = useRef(false);
  useEffect(() => {
    serializeRef.current = serialize;
    deserializeRef.current = deserialize;
  });

  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) setValue(deserializeRef.current(raw));
    } catch {}
    initialized.current = true;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = useCallback(
    (update: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = typeof update === 'function' ? (update as (prev: T) => T)(prev) : update;
        if (initialized.current) {
          try {
            localStorage.setItem(key, serializeRef.current(next));
          } catch {}
        }
        return next;
      });
    },
    [key],
  );

  return [value, set];
}
