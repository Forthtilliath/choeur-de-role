import { useState } from 'react';

/**
 * The `useNow` function in TypeScript returns the current timestamp with an optional threshold value.
 * @param [threshold_ms=0] - The `threshold` parameter in the `useNow` function is a value that can be
 * used to adjust the current time by adding it to the result of `Date.now()`. This allows you to set a
 * specific offset or delay to the current time if needed.
 * @returns The `useNow` custom hook is returning the current timestamp (`now`) with an optional
 * threshold added to it.
 * 
 * @example
 * ```tsx
 * import { useNow } from '@/hooks/useNow';
 * 
 * function MyComponent() {
 *   const now = useNow();
 *   return <div>Current timestamp: {now}</div>;
 * }
 * ```
 * In this example, the `useNow` hook is used to get the current timestamp, which is then displayed in a `div`.
 * You can also pass a `threshold_ms` value to adjust the timestamp as needed.
 * 
 * @example
 * ```tsx
 * import { useNow } from '@/hooks/useNow';
 * 
 * function MyComponent() {
 *   const nowWithOffset = useNow(5000); // Get current timestamp with a 5-second offset
 *   return <div>Current timestamp with offset: {nowWithOffset}</div>;
 * }
 * ```
 * In this example, the `useNow` hook is called with a `threshold_ms` of 5000 milliseconds (5 seconds), which means the returned timestamp will be the current time plus 5 seconds.
 */
export function useNow() {
  const [now] = useState(() => Date.now());

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setNow(Date.now() + threshold_ms);
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, [threshold_ms]);

  return now;
}
