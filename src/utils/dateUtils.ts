/**
 * Utility functions for handling dates with timezone awareness.
 *
 * The main issue: MongoDB stores dates in UTC (e.g., "2026-01-05T00:00:00.000Z").
 * When displayed in Brazil (UTC-3), this becomes "2026-01-04T21:00:00" (previous day).
 *
 * Solution: Parse dates as local dates (ignoring the time component for date-only fields).
 */

/**
 * Parse a date string as a local date, ignoring time/timezone.
 * This ensures "2026-01-05T00:00:00.000Z" is displayed as Jan 5, not Jan 4.
 *
 * @param dateStr - ISO date string from the database
 * @returns Date object set to local midnight of that date
 */
export function parseLocalDate(dateStr: string | Date): Date {
  if (!dateStr) return new Date();

  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;

  // Extract just the date part (YYYY-MM-DD) and create a new date at local midnight
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  return new Date(year, month, day);
}

/**
 * Format a date string for display, handling timezone correctly.
 *
 * @param dateStr - ISO date string from the database
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatLocalDate(
  dateStr: string | Date,
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }
): string {
  const localDate = parseLocalDate(dateStr);
  return localDate.toLocaleDateString('pt-BR', options);
}

/**
 * Get today's date at local midnight for comparison purposes.
 */
export function getLocalToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Check if a date range includes today (for "current" reservations).
 *
 * @param checkInStr - Check-in date string
 * @param checkOutStr - Check-out date string
 * @returns true if today is within the range [checkIn, checkOut]
 */
export function isCurrentReservation(checkInStr: string, checkOutStr: string): boolean {
  const today = getLocalToday();
  const checkIn = parseLocalDate(checkInStr);
  const checkOut = parseLocalDate(checkOutStr);

  return today >= checkIn && today <= checkOut;
}

/**
 * Check if a reservation is upcoming (check-in is in the future).
 *
 * @param checkInStr - Check-in date string
 * @returns true if check-in is after today
 */
export function isUpcomingReservation(checkInStr: string): boolean {
  const today = getLocalToday();
  const checkIn = parseLocalDate(checkInStr);

  return checkIn > today;
}

/**
 * Calculate days until a date.
 *
 * @param dateStr - Target date string
 * @returns Number of days (can be negative if date is in the past)
 */
export function daysUntil(dateStr: string): number {
  const today = getLocalToday();
  const target = parseLocalDate(dateStr);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Calculate nights between two dates.
 *
 * @param checkInStr - Check-in date string
 * @param checkOutStr - Check-out date string
 * @returns Number of nights
 */
export function calculateNights(checkInStr: string, checkOutStr: string): number {
  const checkIn = parseLocalDate(checkInStr);
  const checkOut = parseLocalDate(checkOutStr);
  const diff = checkOut.getTime() - checkIn.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Convert a date string from the database to a value suitable for <input type="date">.
 * Returns YYYY-MM-DD format, preserving the original UTC date.
 *
 * @param dateStr - ISO date string from the database
 * @returns String in YYYY-MM-DD format for date input
 */
export function toLocalDateInputValue(dateStr: string | Date): string {
  if (!dateStr) return '';

  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return '';

  // Use UTC components to get the actual stored date
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
