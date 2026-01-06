'use client';

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { parseLocalDate, formatLocalDate } from '@/utils/dateUtils';

// ============================================================================
// Types
// ============================================================================

export interface CalendarEvent {
  uid: string;
  summary: string;
  start: string;
  end: string;
  status?: string;
  reservationCode?: string;
}

export interface PreRegistration {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  checkInDate: string;
  checkOutDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: string;
  registeredUserId?: string;
  adultsCount?: number;
  childrenCount?: number;
  babiesCount?: number;
  petsCount?: number;
  reservationCode?: string;
  source?: string;
  notes?: string;
  originCountry?: string;
}

export interface Reservation {
  _id: string;
  userId: string;
  guestName: string;
  guestEmail?: string;
  guestPhone: string;
  guestCountry?: string;
  checkInDate: string;
  checkOutDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: string;
  source?: string;
  reservationCode?: string;
  guests?: { name: string; age?: number }[];
  vehicles?: { brand: string; model: string; color: string; licensePlate: string }[];
  numberOfGuests?: number;
  originCountry?: string;
  // Virtual fields from Mongoose
  adultsCount?: number;
  childrenCount?: number;
  babiesCount?: number;
}

export type CalendarViewMode = 'public' | 'staff' | 'admin';

export interface ReservationCalendarProps {
  events: CalendarEvent[];
  preRegistrations?: PreRegistration[];
  reservations?: Reservation[];
  viewMode: CalendarViewMode;
  loading?: boolean;
  lastSync?: string | null;
  onCreatePreRegistration?: (event: CalendarEvent) => void;
}

// ============================================================================
// Utility Functions
// ============================================================================

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/**
 * Convert a date to a YYYY-MM-DD string key using UTC components
 * to avoid timezone shifting issues.
 */
function toDateKey(input?: string | Date | null): string | null {
  if (!input) return null;
  const d = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(d.getTime())) return null;
  // Use UTC components to get the actual stored date
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date key in local timezone
 */
function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convert a local Date object to a YYYY-MM-DD key
 */
function localDateToKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Translate common English event summary strings to Portuguese for display.
 */
function translateSummary(summary?: string | null): string {
  if (!summary) return '';
  const s = String(summary).trim();
  const key = s.toLowerCase();
  const map: Record<string, string> = {
    'reserved': 'Reservado',
    'reservation': 'Reserva',
    'not available': 'Indisponível',
    'airbnb (not available)': 'Bloqueado (Airbnb)',
    'booked': 'Reservado',
  };
  return map[key] || s;
}

/**
 * Format guest count with age breakdown.
 * Prefers virtual fields (adultsCount, childrenCount, babiesCount) when available,
 * falls back to guests array length, then numberOfGuests.
 */
function formatGuestCountDetails(
  reservation?: Reservation | null,
  preReg?: PreRegistration | null
): { total: number; label: string; detailed: boolean } {
  // Try reservation virtual fields first
  if (reservation) {
    const hasVirtuals =
      reservation.adultsCount !== undefined ||
      reservation.childrenCount !== undefined ||
      reservation.babiesCount !== undefined;

    if (hasVirtuals) {
      const adults = reservation.adultsCount || 0;
      const children = reservation.childrenCount || 0;
      const babies = reservation.babiesCount || 0;
      const total = adults + children + babies;
      const parts: string[] = [];
      if (adults > 0) parts.push(`${adults} adulto${adults !== 1 ? 's' : ''}`);
      if (children > 0) parts.push(`${children} criança${children !== 1 ? 's' : ''}`);
      if (babies > 0) parts.push(`${babies} bebê${babies !== 1 ? 's' : ''}`);
      return { total, label: parts.join(', ') || '0 hóspedes', detailed: true };
    }

    // Fallback to guests array length
    if (reservation.guests && reservation.guests.length > 0) {
      const total = reservation.guests.length;
      return { total, label: `${total} hóspede${total !== 1 ? 's' : ''}`, detailed: false };
    }

    // Final fallback to numberOfGuests
    if (reservation.numberOfGuests) {
      const total = reservation.numberOfGuests;
      return { total, label: `${total} hóspede${total !== 1 ? 's' : ''}`, detailed: false };
    }
  }

  // Try pre-registration counts
  if (preReg) {
    const adults = preReg.adultsCount || 0;
    const children = preReg.childrenCount || 0;
    const babies = preReg.babiesCount || 0;
    const total = adults + children + babies;
    if (total > 0) {
      const parts: string[] = [];
      if (adults > 0) parts.push(`${adults} adulto${adults !== 1 ? 's' : ''}`);
      if (children > 0) parts.push(`${children} criança${children !== 1 ? 's' : ''}`);
      if (babies > 0) parts.push(`${babies} bebê${babies !== 1 ? 's' : ''}`);
      return { total, label: parts.join(', '), detailed: true };
    }
  }

  return { total: 1, label: '1 hóspede', detailed: false };
}

// ============================================================================
// Main Component
// ============================================================================

export default function ReservationCalendar({
  events,
  preRegistrations = [],
  reservations = [],
  viewMode,
  loading = false,
  lastSync,
  onCreatePreRegistration,
}: ReservationCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Touch/swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const lastWheelAt = useRef<number>(0);

  const todayKey = getTodayKey();

  // ============================================================================
  // Merge Direct Reservations into Events
  // ============================================================================

  /**
   * Convert direct reservations to CalendarEvents and merge with iCal events.
   * This ensures that reservations with source='direct' appear on the calendar.
   */
  const allEvents = useMemo(() => {
    // Convert direct reservations to CalendarEvent format
    const directReservationEvents: CalendarEvent[] = reservations
      .filter((res) => res.source === 'direct' && res.status !== 'cancelled')
      .map((res) => ({
        uid: `direct-${res._id}`,
        summary: res.guestName || 'Reserva Direta',
        start: res.checkInDate,
        end: res.checkOutDate,
        status: res.status,
        reservationCode: res.reservationCode,
      }));

    // Merge and deduplicate based on date range overlap
    const mergedEvents = [...events];

    for (const directEvent of directReservationEvents) {
      const directStart = toDateKey(directEvent.start);
      const directEnd = toDateKey(directEvent.end);

      // Check if there's already an event with the same date range
      const alreadyExists = mergedEvents.some((event) => {
        const eventStart = toDateKey(event.start);
        const eventEnd = toDateKey(event.end);
        return eventStart === directStart && eventEnd === directEnd;
      });

      if (!alreadyExists) {
        mergedEvents.push(directEvent);
      }
    }

    return mergedEvents;
  }, [events, reservations]);

  // ============================================================================
  // Calendar Days Computation
  // ============================================================================

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [currentDate]);

  // ============================================================================
  // Event Helpers
  // ============================================================================

  const isBlockedEvent = useCallback((event: CalendarEvent) => {
    return event.summary === 'Airbnb (Not available)';
  }, []);

  /**
   * Get events that cover a specific date.
   * For public view: We want to show dates as occupied from check-in through the last night
   * (excluding check-out day itself since guests leave that morning).
   * For staff/admin: date >= start && date < end (iCal semantics where end is exclusive)
   *
   * Note: In iCal format, end is the checkout day (exclusive). So a stay from Jan 5-8 means
   * checkIn=Jan5, checkOut=Jan8, with the guest leaving on the morning of Jan 8.
   */
  const getEventsForDate = useCallback((date: Date) => {
    const dateKey = localDateToKey(date);
    return allEvents.filter((event) => {
      const startKey = toDateKey(event.start);
      const endKey = toDateKey(event.end);
      if (!startKey || !endKey) return false;

      // For all views, use iCal semantics (end is exclusive)
      // The property is occupied from check-in day until the day before check-out
      return dateKey >= startKey && dateKey < endKey;
    });
  }, [allEvents]);

  const getCheckInsForDate = useCallback((date: Date) => {
    const dateKey = localDateToKey(date);
    return allEvents.filter((event) => {
      const startKey = toDateKey(event.start);
      return startKey === dateKey && !isBlockedEvent(event);
    });
  }, [allEvents, isBlockedEvent]);

  const getCheckOutsForDate = useCallback((date: Date) => {
    const dateKey = localDateToKey(date);
    return allEvents.filter((event) => {
      const endKey = toDateKey(event.end);
      return endKey === dateKey && !isBlockedEvent(event);
    });
  }, [allEvents, isBlockedEvent]);

  const isDateBlocked = useCallback((date: Date) => {
    const dateKey = localDateToKey(date);
    return allEvents.some((event) => {
      if (!isBlockedEvent(event)) return false;
      const startKey = toDateKey(event.start);
      const endKey = toDateKey(event.end);
      if (!startKey || !endKey) return false;
      return dateKey >= startKey && dateKey < endKey;
    });
  }, [allEvents, isBlockedEvent]);

  /**
   * Check if a date is reserved (occupied by a guest).
   * For public view: Include check-out day as reserved too (since turnover happens that day).
   * For staff/admin: Use iCal semantics (check-out day is free for new check-in).
   */
  const isDateReserved = useCallback((date: Date) => {
    const dateKey = localDateToKey(date);
    return allEvents.some((event) => {
      if (isBlockedEvent(event)) return false;
      const startKey = toDateKey(event.start);
      const endKey = toDateKey(event.end);
      if (!startKey || !endKey) return false;

      if (viewMode === 'public') {
        // For public view, include check-out day as reserved
        // Check-out day is still not available for new bookings (turnover)
        return dateKey >= startKey && dateKey <= endKey;
      }
      // For staff/admin, check-out day is shown separately
      return dateKey >= startKey && dateKey < endKey;
    });
  }, [allEvents, isBlockedEvent, viewMode]);

  const getPreRegistrationForEvent = useCallback((event: CalendarEvent) => {
    const eventStart = toDateKey(event.start);
    const eventEnd = toDateKey(event.end);
    if (!eventStart || !eventEnd) return null;

    return preRegistrations.find((pr) => {
      const prStart = toDateKey(pr.checkInDate);
      const prEnd = toDateKey(pr.checkOutDate);
      return prStart === eventStart && prEnd === eventEnd;
    }) || null;
  }, [preRegistrations]);

  const getReservationForPreRegistration = useCallback((preReg: PreRegistration | null) => {
    if (!preReg?.registeredUserId) {
      if (preReg?.reservationCode) {
        const code = String(preReg.reservationCode).trim();
        return reservations.find((res) => String(res.reservationCode || '').trim() === code) || null;
      }
      return null;
    }
    const uid = String(preReg.registeredUserId).trim();
    return reservations.find((res) => String(res.userId || '').trim() === uid) || null;
  }, [reservations]);

  /**
   * Get a reservation directly by matching event dates.
   * This is used when there's no pre-registration but we have a matching reservation.
   */
  const getReservationForEvent = useCallback((event: CalendarEvent) => {
    const eventStart = toDateKey(event.start);
    const eventEnd = toDateKey(event.end);
    if (!eventStart || !eventEnd) return null;

    // First try to match by reservation code
    if (event.reservationCode) {
      const code = String(event.reservationCode).trim();
      const byCode = reservations.find((res) => String(res.reservationCode || '').trim() === code);
      if (byCode) return byCode;
    }

    // Then try to match by date range
    return reservations.find((res) => {
      const resStart = toDateKey(res.checkInDate);
      const resEnd = toDateKey(res.checkOutDate);
      return resStart === eventStart && resEnd === eventEnd;
    }) || null;
  }, [reservations]);

  // ============================================================================
  // Navigation
  // ============================================================================

  const goToPreviousMonth = useCallback(() => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  }, [currentDate]);

  const goToNextMonth = useCallback(() => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  }, [currentDate]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    if (viewMode !== 'public') {
      setSelectedDate(today);
    }
  }, [viewMode]);

  // ============================================================================
  // Touch/Wheel Handlers
  // ============================================================================

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        goToNextMonth();
      } else {
        goToPreviousMonth();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY;
    if (Math.abs(delta) < 20) return;
    const now = Date.now();
    if (now - lastWheelAt.current < 300) return;
    lastWheelAt.current = now;
    if (delta > 0) {
      goToNextMonth();
    } else {
      goToPreviousMonth();
    }
  };

  // ============================================================================
  // Keyboard Navigation
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle arrow keys when not focused on an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPreviousMonth();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextMonth();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPreviousMonth, goToNextMonth]);

  // ============================================================================
  // Selected Date Memos
  // ============================================================================

  const selectedDateKey = selectedDate ? localDateToKey(selectedDate) : null;
  const selectedIsPast = useMemo(() => {
    if (!selectedDate) return false;
    const key = localDateToKey(selectedDate);
    if (!key) return false;
    // If selected date is strictly before today -> past
    if (key < todayKey) return true;

    // If selected is today and there are no reservations/check-ins/check-outs and not blocked,
    // treat it as past (same visual treatment as earlier days)
    if (key === todayKey) {
      const noReservations = !isDateReserved(selectedDate);
      const noCheckIns = getCheckInsForDate(selectedDate).length === 0;
      const noCheckOuts = getCheckOutsForDate(selectedDate).length === 0;
      const notBlocked = !isDateBlocked(selectedDate);
      return noReservations && noCheckIns && noCheckOuts && notBlocked;
    }

    return false;
  }, [selectedDate, todayKey, isDateReserved, getCheckInsForDate, getCheckOutsForDate, isDateBlocked]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return getEventsForDate(selectedDate);
  }, [selectedDate, getEventsForDate]);

  const selectedDateCheckIns = useMemo(() => {
    if (!selectedDate) return [];
    return getCheckInsForDate(selectedDate);
  }, [selectedDate, getCheckInsForDate]);

  const selectedDateCheckOuts = useMemo(() => {
    if (!selectedDate) return [];
    return getCheckOutsForDate(selectedDate);
  }, [selectedDate, getCheckOutsForDate]);

  const selectedDateIsBlocked = useMemo(() => {
    if (!selectedDate) return false;
    return isDateBlocked(selectedDate);
  }, [selectedDate, isDateBlocked]);

  // ============================================================================
  // Helper Render Functions
  // ============================================================================

  const isToday = (date: Date) => localDateToKey(date) === todayKey;
  const isPast = (date: Date) => localDateToKey(date) < todayKey;
  const isSelected = (date: Date) => selectedDate && localDateToKey(date) === localDateToKey(selectedDate);

  // ============================================================================
  // Render Calendar Cell
  // ============================================================================

  const renderCalendarCell = (date: Date, index: number) => {
    const dateKey = localDateToKey(date);
    const dayEvents = getEventsForDate(date);
    const checkIns = getCheckInsForDate(date);
    const checkOuts = getCheckOutsForDate(date);
    const blocked = isDateBlocked(date);
    let reserved = isDateReserved(date);
    const hasCheckIn = checkIns.length > 0;
    const hasCheckOut = checkOuts.length > 0;
    const today = isToday(date);
    const selected = isSelected(date);

    // If today has no events/check-ins/check-outs and is not blocked,
    // ensure it's not considered reserved so it renders like past days (no "Reservado" legend).
    if (today && !blocked && dayEvents.length === 0 && checkIns.length === 0 && checkOuts.length === 0) {
      reserved = false;
    }

    // For past determination: if today and has no reservation/check-in/check-out, treat as past
    const todayWithoutReservation = today && !reserved && !hasCheckIn && !hasCheckOut && !blocked;
    const past = isPast(date) || todayWithoutReservation;

    // For admin: check pre-registration status
    const hasPreReg = viewMode === 'admin' && dayEvents.some((e) => getPreRegistrationForEvent(e));
    const allHavePreReg = viewMode === 'admin' && dayEvents.length > 0 && dayEvents.every((e) => getPreRegistrationForEvent(e));

    // Base cell styling - past days always get cursor-default
    let cellClasses = 'relative transition-all ';

    if (viewMode === 'public') {
      // Public view: simpler cells
      cellClasses += 'h-14 md:h-20 flex flex-col items-center justify-center border ';

      if (past) {
        cellClasses += 'bg-gray-100 border-gray-200 text-gray-400 cursor-default ';
      } else if (blocked || reserved) {
        cellClasses += 'bg-red-50 border-red-200 cursor-default ';
      } else {
        cellClasses += 'bg-green-50 border-green-200 hover:bg-green-100 cursor-default ';
      }
    } else {
      // Staff/Admin view: richer cells with indicators
      cellClasses += 'min-h-[80px] lg:min-h-[100px] p-2 border-r border-b border-slate-50 text-left ';

      if (past) {
        cellClasses += 'bg-slate-100 opacity-60 cursor-default ';
      } else if (selected) {
        cellClasses += 'bg-emerald-50 ring-1 ring-emerald-300 cursor-pointer ';
      } else if (blocked) {
        cellClasses += 'bg-zinc-200 cursor-pointer ';
      } else if (hasCheckIn && hasCheckOut) {
        // Both check-in and check-out on same day - white background with half circles
        cellClasses += 'bg-white hover:opacity-90 cursor-pointer ';
      } else if (hasCheckIn) {
        // Check-in only - white background with green half-circle
        cellClasses += 'bg-white hover:bg-slate-50 cursor-pointer ';
      } else if (hasCheckOut) {
        // Check-out only - white background with rose half-circle
        cellClasses += 'bg-white hover:bg-slate-50 cursor-pointer ';
      } else if (reserved) {
        cellClasses += 'bg-rose-100 hover:bg-rose-150 cursor-pointer ';
      } else {
        cellClasses += 'bg-white hover:bg-slate-50 cursor-pointer ';
      }
    }

    // Day number styling
    let dayNumberClasses = 'inline-flex items-center justify-center font-medium ';

    if (viewMode === 'public') {
      dayNumberClasses += 'text-lg ';
      if (today && !past) {
        dayNumberClasses += 'w-8 h-8 rounded-full bg-emerald-500 text-white ';
      } else if (blocked || reserved) {
        dayNumberClasses += 'text-red-700 ';
      } else if (past) {
        dayNumberClasses += 'text-gray-400 ';
      } else {
        dayNumberClasses += 'text-gray-800 ';
      }
    } else {
      dayNumberClasses += 'w-7 h-7 text-sm rounded-full ';
      if (today && !past) {
        dayNumberClasses += 'bg-emerald-500 text-white ';
      } else if (selected) {
        dayNumberClasses += 'bg-emerald-200 text-emerald-800 ';
      } else if (past) {
        dayNumberClasses += 'text-slate-400 ';
      } else if (blocked) {
        dayNumberClasses += 'text-zinc-600 ';
      } else if (reserved || hasCheckIn || hasCheckOut) {
        dayNumberClasses += 'text-rose-700 ';
      } else {
        dayNumberClasses += 'text-slate-700 ';
      }
    }

    const handleClick = () => {
      if (viewMode !== 'public' && !past) {
        setSelectedDate(date);
      }
    };

    return (
      <button
        key={`day-${dateKey}`}
        onClick={handleClick}
        disabled={viewMode === 'public' || past}
        className={cellClasses}
      >
        {/* Half-circle for check-out (left side) - previous guest leaving */}
        {hasCheckOut && !past && viewMode !== 'public' && (
          <div className="absolute inset-y-0 left-0 w-1/2 bg-rose-100 rounded-r-full flex items-center justify-start pl-1">
            <div className="flex flex-col items-start">
              <div className="flex flex-row gap-1 items-start">
                <ArrowRightIcon className="h-3 w-3 text-rose-500 rotate-45" />
                <span className="text-[10px] text-rose-600 font-medium">Saída</span>
              </div>
              {/* Show first checkout time (if available) */}
              {checkOuts[0] && (() => {
                const e = checkOuts[0];
                const pr = getPreRegistrationForEvent(e);
                const res = getReservationForPreRegistration(pr) || getReservationForEvent(e);
                const t = res?.checkOutTime || pr?.checkOutTime || '11:00';
                return (
                  <span className="text-[10px] text-rose-600/80">{t}</span>
                );
              })()}
            </div>
          </div>
        )}

        {/* Half-circle for check-in (right side) - new guest arriving */}
        {hasCheckIn && !past && viewMode !== 'public' && (
          <div className="absolute inset-y-0 right-0 w-1/2 bg-rose-100 rounded-l-full flex items-center justify-end pr-1">
            <div className="flex flex-col items-end">
              <div className="flex flex-row gap-1 items-end">
                <ArrowTrendingUpIcon className="h-3 w-3 text-emerald-500" />
                <span className="text-[10px] text-emerald-600 font-medium">Entrada</span>
              </div>
              {/* Show first checkin time (if available) */}
              {checkIns[0] && (() => {
                const e = checkIns[0];
                const pr = getPreRegistrationForEvent(e);
                const res = getReservationForPreRegistration(pr) || getReservationForEvent(e);
                const t = res?.checkInTime || pr?.checkInTime || '15:00';
                return (
                  <span className="text-[10px] text-emerald-600/80">{t}</span>
                );
              })()}
            </div>
          </div>
        )}

        {/* Day content */}
        <div className="relative z-10 flex flex-col h-full w-full">
          <span className={dayNumberClasses}>
            {date.getDate()}
          </span>

          {/* Indicators for staff/admin - only when there's no check-in or check-out */}
          {viewMode !== 'public' && !past && !hasCheckIn && !hasCheckOut && (
            <div className="flex-1 mt-1 space-y-1">
              {reserved && !blocked && (
                <div className="flex items-center gap-1">
                  <UserGroupIcon className="h-3 w-3 text-rose-500" />
                  <span className="text-[10px] text-rose-600 font-medium truncate">
                    Ocupado
                  </span>
                </div>
              )}
              {blocked && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-zinc-500 font-medium truncate">
                    Bloqueado
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Admin-specific indicators */}
          {viewMode === 'admin' && !past && !blocked && dayEvents.length > 0 && (
            <div className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-0.5 justify-center">
              <div
                className={`w-2 h-2 rounded-full ${
                  allHavePreReg ? 'bg-green-500' : hasPreReg ? 'bg-yellow-500' : 'bg-red-400'
                }`}
                title={allHavePreReg ? 'Pré-cadastro completo' : hasPreReg ? 'Pré-cadastro parcial' : 'Sem pré-cadastro'}
              />
            </div>
          )}

          {/* Public view: show "Reservado" text on blocked/reserved days */}
          {viewMode === 'public' && (blocked || reserved) && !past && (
            <span className="text-xs text-red-500 hidden md:block">Reservado</span>
          )}
        </div>
      </button>
    );
  };

  // ============================================================================
  // Render Selected Day Details (Staff/Admin only)
  // ============================================================================

  const renderSelectedDayDetails = () => {
    if (viewMode === 'public') return null;

    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">
            {selectedDate
              ? selectedDate.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })
              : 'Selecione uma data'}
          </h2>
        </div>

        {!selectedDate ? (
          <div className="p-8 text-center text-slate-400">
            <CalendarDaysIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              Clique em um dia para ver os detalhes
            </p>
          </div>
        ) : selectedIsPast ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <CalendarDaysIcon className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="font-medium text-slate-600 mb-1">Data passada</h3>
            <p className="text-sm text-slate-400">Informações históricas não disponíveis</p>
          </div>
        ) : selectedDateIsBlocked ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-200 flex items-center justify-center">
              <CalendarDaysIcon className="h-8 w-8 text-zinc-600" />
            </div>
            <h3 className="font-medium text-slate-800 mb-1">Dia bloqueado</h3>
            <p className="text-sm text-slate-500">Este dia está marcado como bloqueado pelo anfitrião (Airbnb).</p>
          </div>
        ) : selectedDateEvents.length === 0 &&
          selectedDateCheckIns.length === 0 &&
          selectedDateCheckOuts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="font-medium text-slate-800 mb-1">Data Disponível</h3>
            <p className="text-sm text-slate-500">Não há reservas para esta data</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
            {/* Check-ins */}
            {selectedDateCheckIns.length > 0 && (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800">Check-in</h3>
                    <p className="text-xs text-slate-500">Entrada às 15:00</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {selectedDateCheckIns.map((event) => renderEventCard(event, 'checkin'))}
                </div>
              </div>
            )}

            {/* Check-outs */}
            {selectedDateCheckOuts.length > 0 && (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                    <ArrowRightIcon className="h-4 w-4 text-rose-600 rotate-45" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800">Check-out</h3>
                    <p className="text-xs text-slate-500">Saída até 11:00</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {selectedDateCheckOuts.map((event) => renderEventCard(event, 'checkout'))}
                </div>
              </div>
            )}

            {/* Currently Staying (mid-stay) */}
            {selectedDateEvents.length > 0 &&
              selectedDateCheckIns.length === 0 &&
              selectedDateCheckOuts.length === 0 && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                      <UserGroupIcon className="h-4 w-4 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-800">Ocupado</h3>
                      <p className="text-xs text-slate-500">Hospedagem de trânsito</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {selectedDateEvents.map((event) => renderEventCard(event, 'staying'))}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // Render Event Card
  // ============================================================================

  const renderEventCard = (event: CalendarEvent, type: 'checkin' | 'checkout' | 'staying') => {
    const preReg = getPreRegistrationForEvent(event);
    // Try to get reservation from preReg first, then try direct match by event dates
    const reservation = getReservationForPreRegistration(preReg) || getReservationForEvent(event);

    const bgColor = type === 'checkin' ? 'bg-emerald-50' : type === 'checkout' ? 'bg-rose-50' : 'bg-slate-50';
    const iconColor = type === 'checkin' ? 'from-emerald-400 to-teal-500' : type === 'checkout' ? 'from-rose-400 to-pink-500' : 'from-slate-400 to-slate-500';
    const timeColor = type === 'checkin' ? 'text-emerald-600' : type === 'checkout' ? 'text-rose-600' : 'text-slate-600';
    const time = type === 'checkin'
      ? (reservation?.checkInTime || preReg?.checkInTime || '15:00')
      : type === 'checkout'
        ? (reservation?.checkOutTime || preReg?.checkOutTime || '11:00')
        : null;

    // Calculate guest count with age breakdown
    const guestInfo = formatGuestCountDetails(reservation, preReg);

    // Get origin country
    const originCountry = reservation?.guestCountry || preReg?.originCountry || reservation?.originCountry;

    // For staff view: enhanced info with more details
    if (viewMode === 'staff') {
      return (
        <div
          key={event.uid}
          className={`p-3 ${bgColor} rounded-xl space-y-2`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${iconColor} flex items-center justify-center text-white font-semibold text-xs`}>
                <UserGroupIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-slate-800 text-sm">
                  {preReg?.name || reservation?.guestName || translateSummary(event.summary) || 'Reserva'}
                </p>
                <p className="text-xs text-slate-500">
                  {type === 'checkin'
                    ? `Até ${formatLocalDate(event.end, { day: '2-digit', month: 'short' })}`
                    : type === 'checkout'
                    ? `Desde ${formatLocalDate(event.start, { day: '2-digit', month: 'short' })}`
                    : `${formatLocalDate(event.start, { day: '2-digit', month: 'short' })} → ${formatLocalDate(event.end, { day: '2-digit', month: 'short' })}`}
                </p>
              </div>
            </div>
            {time && (
              <div className={`flex items-center gap-1 ${timeColor}`}>
                <ClockIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{time}</span>
              </div>
            )}
          </div>
          {/* Additional details row */}
          <div className="flex items-center gap-4 text-xs text-slate-500 ml-11">
            <div className="flex items-center gap-1">
              <UserGroupIcon className="h-3 w-3" />
              <span>{guestInfo.label}</span>
            </div>
            {originCountry && (
              <div className="flex items-center gap-1">
                <GlobeAltIcon className="h-3 w-3" />
                <span>{originCountry}</span>
              </div>
            )}
            {/* {(preReg?.phone || reservation?.guestPhone) && (
              <div className="flex items-center gap-1">
                <PhoneIcon className="h-3 w-3" />
                <span>{preReg?.phone || reservation?.guestPhone}</span>
              </div>
            )} */}
          </div>
        </div>
      );
    }

    // For admin view: full details with pre-registration status
    if (viewMode === 'admin') {
      if (reservation) {
        // Show reservation data
        return (
          <div key={event.uid} className={`${bgColor} rounded-xl p-4`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-slate-800">{reservation.guestName}</p>
                <p className="text-xs text-slate-500">{event.reservationCode}</p>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Cadastro completo
              </span>
            </div>
            <div className="space-y-1 text-sm text-slate-600">
              {reservation.guestPhone && (
                <div className="flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4 text-slate-400" />
                  {reservation.guestPhone}
                </div>
              )}
              {reservation.guestEmail && (
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="h-4 w-4 text-slate-400" />
                  {reservation.guestEmail}
                </div>
              )}
              <div className="flex items-center gap-2">
                <UserGroupIcon className="h-4 w-4 text-slate-400" />
                {guestInfo.label}
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-slate-400" />
                {formatLocalDate(event.start)} → {formatLocalDate(event.end)}
              </div>
            </div>
            <Link
              href={`/admin/reservas/${reservation._id}`}
              className="mt-3 flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Ver reserva completa
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        );
      } else if (preReg) {
        // Show pre-registration data
        return (
          <div key={event.uid} className={`${bgColor} rounded-xl p-4`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-slate-800">{preReg.name}</p>
                <p className="text-xs text-slate-500">{preReg.reservationCode || event.reservationCode}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                preReg.status === 'registered'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {preReg.status === 'registered' ? 'Registrado' : 'Pré-cadastro pendente'}
              </span>
            </div>
            <div className="space-y-1 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 text-slate-400" />
                {preReg.phone}
              </div>
              {preReg.email && (
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="h-4 w-4 text-slate-400" />
                  {preReg.email}
                </div>
              )}
              <div className="flex items-center gap-2">
                <UserGroupIcon className="h-4 w-4 text-slate-400" />
                {guestInfo.label}
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-slate-400" />
                {formatLocalDate(preReg.checkInDate)} → {formatLocalDate(preReg.checkOutDate)}
              </div>
            </div>
            <Link
              href={`/admin/pre-cadastros?id=${preReg._id}`}
              className="mt-3 flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              Ver pré-cadastro
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        );
      } else {
        // No pre-registration - offer to create
        return (
          <div key={event.uid} className={`${bgColor} rounded-xl p-4`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-slate-800">
                  {(() => {
                    const disp = translateSummary(event.summary);
                    return disp === 'Reservado' ? 'Reserva Airbnb' : (disp || 'Reserva');
                  })()}
                </p>
                <p className="text-xs text-slate-500">{event.reservationCode}</p>
              </div>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full flex items-center gap-1">
                <ExclamationTriangleIcon className="h-3 w-3" />
                Sem pré-cadastro
              </span>
            </div>
            <div className="space-y-1 text-sm text-slate-600 mb-3">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-slate-400" />
                {formatLocalDate(event.start)} → {formatLocalDate(event.end)}
              </div>
            </div>
            {onCreatePreRegistration && (
              <button
                onClick={() => onCreatePreRegistration(event)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
              >
                <UserPlusIcon className="h-4 w-4" />
                Criar Pré-cadastro
              </button>
            )}
          </div>
        );
      }
    }

    return null;
  };

  // ============================================================================
  // Render Legend
  // ============================================================================

  const renderLegend = () => {
    if (viewMode === 'public') {
      return (
        <div className="flex flex-wrap gap-6 mb-8 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-100 border-2 border-green-500 rounded"></div>
            <span className="text-gray-700">Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-100 border-2 border-red-400 rounded"></div>
            <span className="text-gray-700">Reservado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">5</span>
            </div>
            <span className="text-gray-700">Hoje</span>
          </div>
        </div>
      );
    }

    return (
      <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500" />
          <span className="text-xs text-slate-500">Check-in (15:00)</span>
        </div>
        <div className="flex items-center gap-2">
          <ArrowRightIcon className="h-4 w-4 text-rose-500 rotate-45" />
          <span className="text-xs text-slate-500">Check-out (11:00)</span>
        </div>
        <div className="flex items-center gap-2">
          <UserGroupIcon className="h-4 w-4 text-rose-500" />
          <span className="text-xs text-slate-500">Ocupado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white border border-slate-200" />
          <span className="text-xs text-slate-500">Disponível</span>
        </div>
      </div>
    );
  };

  // ============================================================================
  // Main Render
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-slate-500">Carregando calendário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={viewMode === 'public' ? '' : 'grid grid-cols-1 xl:grid-cols-3 gap-6'}>
      {/* Calendar */}
      <div
        className={`${viewMode === 'public' ? 'max-w-4xl mx-auto' : 'xl:col-span-2'} bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {/* Public view legend above calendar */}
        {viewMode === 'public' && renderLegend()}

        {/* Month Navigation */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Mês anterior"
          >
            <ChevronLeftIcon className="h-5 w-5 text-slate-600" />
          </button>
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800">
              {MONTH_NAMES[currentDate.getMonth()]}
            </h2>
            <p className="text-sm text-slate-500">{currentDate.getFullYear()}</p>
            {viewMode === 'public' && (
              <button
                onClick={goToToday}
                className="text-sm text-amber-600 hover:text-amber-700 mt-1"
              >
                Ir para hoje
              </button>
            )}
          </div>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Próximo mês"
          >
            <ChevronRightIcon className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-100">
          {WEEK_DAYS.map((day) => (
            <div
              key={day}
              className="py-3 text-center text-sm font-medium text-slate-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((date, index) => {
            if (!date) {
              return (
                <div
                  key={`empty-${index}`}
                  className={`${viewMode === 'public' ? 'h-14 md:h-20' : 'min-h-[80px] lg:min-h-[100px]'} bg-slate-50 border-r border-b border-slate-50`}
                />
              );
            }
            return renderCalendarCell(date, index);
          })}
        </div>

        {/* Staff/Admin view legend below calendar */}
        {viewMode !== 'public' && renderLegend()}
      </div>

      {/* Selected Day Details (Staff/Admin only) */}
      {renderSelectedDayDetails()}
    </div>
  );
}
