import { useCallback, useEffect, useRef, useState } from 'react';

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
  const initializedRef = useRef(false);
  useEffect(() => {
    serializeRef.current = serialize;
    deserializeRef.current = deserialize;
  });

  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) setValue(deserializeRef.current(raw));
    } catch {
      // localStorage indisponible (quota, navigation privée...) : ignoré volontairement.
    }
    initializedRef.current = true;
  }, [key]);

  const set = useCallback(
    (update: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = typeof update === 'function' ? (update as (prev: T) => T)(prev) : update;
        if (initializedRef.current) {
          try {
            localStorage.setItem(key, serializeRef.current(next));
          } catch {
            // localStorage indisponible (quota, navigation privée...) : ignoré volontairement.
          }
        }
        return next;
      });
    },
    [key],
  );

  return [value, set];
}
