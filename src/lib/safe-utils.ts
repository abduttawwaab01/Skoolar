import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Safely ensure an array. Returns [] if the input is undefined, null, or not an array.
 * This prevents "X.map is not a function" errors when API data is unexpected.
 */
export function ensureArray<T>(value: T | undefined | null): T[] {
  if (!value) return [];
  if (!Array.isArray(value)) return [];
  return value;
}

/**
 * Safe array map - ensures value is an array before mapping
 */
export function safeMap<T, U>(
  value: T | undefined | null | unknown,
  mapper: (item: T, index: number) => U
): U[] {
  if (!value || !Array.isArray(value)) return [];
  return value.map(mapper);
}

/**
 * Safe object property access - returns default if property is undefined/null
 */
export function safeProp<T, K extends keyof T>(obj: T | undefined | null, key: K, defaultValue: T[K]): T[K] {
  if (!obj) return defaultValue;
  const val = obj[key];
  return val !== undefined && val !== null ? val : defaultValue;
}