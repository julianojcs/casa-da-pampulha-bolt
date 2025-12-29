import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a value for display. Returns "-" for null, undefined, or NaN values.
 * @param value - The value to format
 * @param suffix - Optional suffix to append (e.g., " quartos")
 */
export function formatValue(
  value: string | number | null | undefined,
  suffix?: string
): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number' && !Number.isFinite(value)) return '-';
  if (typeof value === 'string' && value.trim() === '') return '-';

  const displayValue = String(value);
  return suffix ? `${displayValue}${suffix}` : displayValue;
}

/**
 * Format a rating value for display. Returns "-" for invalid values.
 * @param value - The rating value
 * @param decimals - Number of decimal places (default: 2)
 */
export function formatRating(
  value: number | string | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined) return '-';

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (!Number.isFinite(num)) return '-';

  return num.toFixed(decimals);
}

/**
 * Convert Decimal128 or other MongoDB numeric types to primitive number
 * Returns null if conversion fails or value is null/undefined
 */
export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;

  // Handle Decimal128 format from MongoDB
  if (typeof value === 'object' && value !== null && '$numberDecimal' in value) {
    const parsed = Number((value as { $numberDecimal: string }).$numberDecimal);
    return Number.isFinite(parsed) ? parsed : null;
  }

  // Handle objects with toString (like Decimal128 instances)
  if (typeof value === 'object' && value !== null && typeof (value as any).toString === 'function') {
    const parsed = Number((value as any).toString());
    return Number.isFinite(parsed) ? parsed : null;
  }

  // Handle strings
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  // Handle numbers
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  return null;
}
