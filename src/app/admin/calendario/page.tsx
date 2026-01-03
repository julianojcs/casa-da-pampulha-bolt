'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarDaysIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserPlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  ArrowRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface CalendarEvent {
  uid: string;
  summary: string;
  start: string;
  end: string;
  status: string;
  reservationCode?: string;
}

interface PreRegistration {
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
}

interface Reservation {
  _id: string;
  userId: string;
  guestName: string;
  guestEmail?: string;
  guestPhone: string;
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
}

export default function CalendarioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [preRegistrations, setPreRegistrations] = useState<PreRegistration[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Touch/swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Mouse wheel navigation (debounced)
  const lastWheelAt = useRef<number>(0);
  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY;
    // ignore very small scrolls
    if (Math.abs(delta) < 20) return;
    const now = Date.now();
    if (now - lastWheelAt.current < 300) return; // debounce
    lastWheelAt.current = now;
    if (delta > 0) {
      goToNextMonth();
    } else {
      goToPreviousMonth();
    }
    e.preventDefault();
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [calRes, preRegRes, reservationsRes] = await Promise.all([
        fetch('/api/calendar'),
        fetch('/api/pre-registration'),
        fetch('/api/reservations'),
      ]);

      if (calRes.ok) {
        const calData = await calRes.json();
        setEvents(calData.events || []);
        setLastSync(calData.lastSync);
      }

      if (preRegRes.ok) {
        const preRegData = await preRegRes.json();
        setPreRegistrations(preRegData);
      }

      if (reservationsRes.ok) {
        const reservationsData = await reservationsRes.json();
        setReservations(reservationsData.reservations || reservationsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/calendar');
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
        setLastSync(data.lastSync);
        toast.success('Calendário sincronizado!');
      } else {
        toast.error('Erro ao sincronizar calendário');
      }
    } catch (error) {
      toast.error('Erro ao sincronizar calendário');
    } finally {
      setSyncing(false);
    }
  };

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  // Touch handlers for swipe
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

  // Calendar days computation
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

  // Helper functions
  const toDateKey = (input?: string | Date | null) => {
    if (!input) return null;
    let d = new Date(input);
    if (isNaN(d.getTime())) {
      d = new Date(input + 'T00:00:00');
      if (isNaN(d.getTime())) return null;
    }
    return d.toISOString().split('T')[0];
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = toDateKey(date);
    if (!dateStr) return [];
    return events.filter((event) => {
      const start = toDateKey(event.start);
      const end = toDateKey(event.end);
      if (!start || !end) return false;
      return dateStr >= start && dateStr < end;
    });
  };

  const getCheckInsForDate = (date: Date) => {
    const dateStr = toDateKey(date);
    return events.filter((event) => toDateKey(event.start) === dateStr && event.summary !== 'Airbnb (Not available)');
  };

  const getCheckOutsForDate = (date: Date) => {
    const dateStr = toDateKey(date);
    return events.filter((event) => toDateKey(event.end) === dateStr && event.summary !== 'Airbnb (Not available)');
  };

  const getPreRegistrationForEvent = (event: CalendarEvent) => {
    const eventStart = toDateKey(event.start);
    const eventEnd = toDateKey(event.end);
    if (!eventStart || !eventEnd) return null;

    return preRegistrations.find((pr) => {
      const prStart = toDateKey(pr.checkInDate);
      const prEnd = toDateKey(pr.checkOutDate);
      return prStart === eventStart && prEnd === eventEnd;
    });
  };

  const getReservationForPreRegistration = (preReg: PreRegistration) => {
    if (!preReg.registeredUserId) return null;
    // Prefer matching by registeredUserId across reservations (normalize values)
    const uid = String(preReg.registeredUserId).trim();
    const byUser = reservations.find((res) => String(res.userId || '').trim() === uid) || null;
    if (byUser) return byUser;

    // Fallback: match by reservationCode if provided (normalize)
    if (preReg.reservationCode) {
      const code = String(preReg.reservationCode).trim();
      return (
        reservations.find((res) => String(res.reservationCode || '').trim() === code) || null
      );
    }

    return null;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleCreatePreRegistration = (event: CalendarEvent) => {
    const params = new URLSearchParams({
      checkInDate: event.start,
      checkOutDate: event.end,
      reservationCode: event.reservationCode || '',
    });
    router.push(`/admin/pre-cadastros?create=true&${params.toString()}`);
  };

  // Selected date data
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return getEventsForDate(selectedDate);
  }, [selectedDate, events]);

  const selectedDateCheckIns = useMemo(() => {
    if (!selectedDate) return [];
    return getCheckInsForDate(selectedDate);
  }, [selectedDate, events]);

  const selectedDateCheckOuts = useMemo(() => {
    if (!selectedDate) return [];
    return getCheckOutsForDate(selectedDate);
  }, [selectedDate, events]);

  const selectedDateIsBlocked = useMemo(() => {
    if (!selectedDate) return false;
    const dateKey = toDateKey(selectedDate);
    if (!dateKey) return false;

    // Check if date is within any "Airbnb (Not available)" period (end is exclusive)
    return events.some((e) => {
      if (e.summary !== 'Airbnb (Not available)') return false;
      const s = toDateKey(e.start);
      const en = toDateKey(e.end);
      if (!s || !en) return false;
      return dateKey >= s && dateKey < en;
    });
  }, [selectedDate, events]);

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
            Calendário Airbnb
          </h1>
          <p className="text-gray-500 mt-1">
            Visualize reservas e gerencie pré-cadastros
            {lastSync && (
              <span className="ml-2 text-xs text-gray-400">
                • Última sincronização: {new Date(lastSync).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-5 w-5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar'}
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600 text-sm font-medium"
          >
            Hoje
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar */}
        <div
          ref={calendarRef}
          className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          {/* Month Navigation */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800">
                {monthNames[currentDate.getMonth()]}
              </h2>
              <p className="text-sm text-gray-500">{currentDate.getFullYear()}</p>
            </div>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square border-b border-r border-gray-50" />;
              }

              const dayEvents = getEventsForDate(date);
              const hasEvents = dayEvents.length > 0;
              const checkIns = getCheckInsForDate(date);
              const checkOuts = getCheckOutsForDate(date);
              const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

              // Check if any event on this day has pre-registration
              const hasPreReg = dayEvents.some((e) => getPreRegistrationForEvent(e));
              const allHavePreReg = dayEvents.length > 0 && dayEvents.every((e) => getPreRegistrationForEvent(e));

              // Check if this date is within a blocked period (inclusive end)
              const dateKey = toDateKey(date);
              const isBlockedByAirbnb = dateKey ? events.some((e) => {
                if (e.summary !== 'Airbnb (Not available)') return false;
                const s = toDateKey(e.start);
                const en = toDateKey(e.end);
                if (!s || !en) return false;
                return dateKey >= s && dateKey < en;
              }) : false;
              // Check if this date has reservation events (exclusive end, like normal reservations)
              const hasReservationEvent = dateKey ? events.some((e) => {
                if (e.summary === 'Airbnb (Not available)') return false;
                const s = toDateKey(e.start);
                const en = toDateKey(e.end);
                if (!s || !en) return false;
                return dateKey >= s && dateKey < en;
              }) : false;

              let cellClass = 'aspect-square p-2 border-b border-r border-slate-200 relative transition-all';
              if (isSelected(date)) {
                cellClass += ' bg-emerald-100 ring-1 ring-emerald-300';
              } else if (isBlockedByAirbnb) {
                cellClass += ' bg-zinc-300';
              } else if (checkOuts.length > 0) {
                // Check-out day has a distinct background similar to ongoing stays
                cellClass += ' bg-rose-50';
              } else if (hasReservationEvent) {
                cellClass += ' bg-rose-200';
              } else {
                cellClass += ' bg-white hover:bg-slate-50';
              }
              if (isPast) cellClass += ' opacity-60';

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={cellClass}
                >
                  <div className={`text-sm font-medium ${isSelected(date) ? 'text-emerald-700' : 'text-gray-800'}`}>
                    {date.getDate()}
                  </div>

                      {/* Indicators (hidden for Airbnb blocked days) */}
                      {!isBlockedByAirbnb && (
                        <div className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-0.5 justify-center">
                          {hasEvents && (
                            <div
                              className={`w-2 h-2 rounded-full ${
                                allHavePreReg ? 'bg-green-500' : hasPreReg ? 'bg-yellow-500' : 'bg-red-400'
                              }`}
                              title={allHavePreReg ? 'Pré-cadastro completo' : hasPreReg ? 'Pré-cadastro parcial' : 'Sem pré-cadastro'}
                            />
                          )}
                          {checkIns.length > 0 && (
                            <div className="w-2 h-2 rounded-full bg-yellow-500" title="Check-in" />
                          )}
                          {checkOuts.length > 0 && (
                            <div className="w-2 h-2 rounded-full bg-blue-500" title="Check-out" />
                          )}
                        </div>
                      )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-6 flex-wrap text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <span className="text-gray-600">Reservado (sem pré-cadastro)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-600">Pré-cadastro completo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-gray-600">Check-in</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-600">Check-out</span>
            </div>
          </div>
        </div>

        {/* Selected Day Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">
              {selectedDate ? (
                <span>
                  {selectedDate.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                  })}
                </span>
              ) : (
                'Selecione uma data'
              )}
            </h3>
          </div>

          {!selectedDate ? (
            <div className="p-8 text-center">
              <CalendarDaysIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Clique em uma data para ver detalhes</p>
            </div>
          ) : selectedDateIsBlocked ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-200 flex items-center justify-center">
                <CalendarDaysIcon className="h-8 w-8 text-zinc-700" />
              </div>
              <h3 className="font-medium text-gray-800 mb-1">Dia bloqueado</h3>
              <p className="text-sm text-gray-500">Este dia está marcado como bloqueado pelo anfitrião (Airbnb).</p>
            </div>
          ) : selectedDateEvents.length === 0 &&
            selectedDateCheckIns.length === 0 &&
            selectedDateCheckOuts.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircleIcon className="h-12 w-12 text-green-300 mx-auto mb-3" />
              <p className="text-gray-500">Disponível</p>
              <p className="text-sm text-gray-400 mt-1">Nenhuma reserva nesta data</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {/* Check-ins */}
              {selectedDateCheckIns.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h4 className="font-medium text-emerald-700 text-sm uppercase">Check-ins</h4>
                  </div>
                    {selectedDateCheckIns.map((event) => {
                    const preReg = getPreRegistrationForEvent(event);
                    // Try to find reservation by registeredUserId first, then by reservationCode
                    let reservation: Reservation | null = null;
                    if (preReg?.registeredUserId) {
                      const uid = String(preReg.registeredUserId).trim();
                      reservation = reservations.find((r) => String(r.userId || '').trim() === uid) || null;
                    }
                    if (!reservation && (preReg?.reservationCode || event.reservationCode)) {
                      const code = String(preReg?.reservationCode || event.reservationCode || '').trim();
                      reservation = reservations.find((r) => String(r.reservationCode || '').trim() === code) || null;
                    }

                    return (
                      <div key={event.uid} className="bg-emerald-50 rounded-xl p-4 mb-2">
                        {reservation ? (
                          // Show reservation data
                          <>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-gray-800">{reservation.guestName}</p>
                                <p className="text-xs text-gray-500">{event.reservationCode}</p>
                              </div>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                Cadastro completo
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              {reservation.guestPhone && (
                                <div className="flex items-center gap-2">
                                  <PhoneIcon className="h-4 w-4 text-gray-400" />
                                  {reservation.guestPhone}
                                </div>
                              )}
                              {reservation.guestEmail && (
                                <div className="flex items-center gap-2">
                                  <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                                  {reservation.guestEmail}
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <UserGroupIcon className="h-4 w-4 text-gray-400" />
                                {reservation.guests?.length || reservation.numberOfGuests} hóspede(s)
                              </div>
                              <div className="flex items-center gap-2">
                                <ClockIcon className="h-4 w-4 text-gray-400" />
                                {formatDate(event.start)} → {formatDate(event.end)}
                              </div>
                            </div>
                            <Link
                              href={`/admin/reservas/${reservation._id}`}
                              className="mt-3 flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                              Ver reserva completa
                              <ArrowRightIcon className="h-4 w-4" />
                            </Link>
                          </>
                        ) : preReg ? (
                          // Show pre-registration data
                          <>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-gray-800">{preReg.name}</p>
                                <p className="text-xs text-gray-500">{preReg.reservationCode || event.reservationCode}</p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                preReg.status === 'registered'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {preReg.status === 'registered' ? 'Registrado' : 'Pré-cadastro pendente'}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <PhoneIcon className="h-4 w-4 text-gray-400" />
                                {preReg.phone}
                              </div>
                              {preReg.email && (
                                <div className="flex items-center gap-2">
                                  <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                                  {preReg.email}
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <UserGroupIcon className="h-4 w-4 text-gray-400" />
                                {(preReg.adultsCount || 1) + (preReg.childrenCount || 0)} hóspede(s)
                              </div>
                              <div className="flex items-center gap-2">
                                <ClockIcon className="h-4 w-4 text-gray-400" />
                                {formatDate(preReg.checkInDate)} → {formatDate(preReg.checkOutDate)}
                              </div>
                            </div>
                            {reservation && (reservation as any)?._id ? (
                              <Link
                                href={`/admin/reservas/${(reservation as any)._id}`}
                                className="mt-3 flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium"
                              >
                                Ver reserva
                                <ArrowRightIcon className="h-4 w-4" />
                              </Link>
                            ) : (
                              <Link
                                href={`/admin/pre-cadastros?id=${preReg._id}`}
                                className="mt-3 flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium"
                              >
                                Ver pré-cadastro
                                <ArrowRightIcon className="h-4 w-4" />
                              </Link>
                            )}
                          </>
                        ) : (
                          // No pre-registration - offer to create
                          <>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {event.summary === 'Reserved' || event.summary === 'Reservado'
                                    ? 'Reserva Airbnb'
                                    : event.summary}
                                </p>
                                <p className="text-xs text-gray-500">{event.reservationCode}</p>
                              </div>
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full flex items-center gap-1">
                                <ExclamationTriangleIcon className="h-3 w-3" />
                                Sem pré-cadastro
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-2">
                                <ClockIcon className="h-4 w-4 text-gray-400" />
                                {formatDate(event.start)} → {formatDate(event.end)}
                              </div>
                            </div>
                            {event.summary !== 'Airbnb (Not available)' && (
                              <button
                                onClick={() => handleCreatePreRegistration(event)}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                              >
                                <UserPlusIcon className="h-4 w-4" />
                                Criar Pré-cadastro
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Check-outs */}
              {selectedDateCheckOuts.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <h4 className="font-medium text-blue-700 text-sm uppercase">Check-out</h4>
                  </div>
                  {selectedDateCheckOuts.map((event) => {
                    const preReg = getPreRegistrationForEvent(event);
                    return (
                      <div key={event.uid} className="bg-blue-50 rounded-xl p-4 mb-2">
                        <p className="font-medium text-gray-800">
                          {preReg?.name || (event.summary === 'Reserved' ? 'Reserva Airbnb' : event.summary)}
                        </p>
                        <p className="text-xs text-gray-500">{event.reservationCode}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                          <ClockIcon className="h-4 w-4 text-gray-400" />
                          {formatDate(event.start)} → {formatDate(event.end)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Ongoing stays (not check-in or check-out) */}
              {selectedDateEvents.length > 0 &&
                selectedDateCheckIns.length === 0 &&
                selectedDateCheckOuts.length === 0 && (
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                      <h4 className="font-medium text-gray-700 text-sm uppercase">Hospedagem em andamento</h4>
                    </div>
                    {selectedDateEvents.map((event) => {
                      const preReg = getPreRegistrationForEvent(event);
                      // Try to find reservation by registeredUserId first, then by reservationCode
                      let reservation: Reservation | null = null;
                      if (preReg?.registeredUserId) {
                        const uid = String(preReg.registeredUserId).trim();
                        reservation = reservations.find((r) => String(r.userId || '').trim() === uid) || null;
                      }
                      if (!reservation && (preReg?.reservationCode || event.reservationCode)) {
                        const code = String(preReg?.reservationCode || event.reservationCode || '').trim();
                        reservation = reservations.find((r) => String(r.reservationCode || '').trim() === code) || null;
                      }

                      return (
                        <div key={event.uid} className="bg-gray-50 rounded-xl p-4 mb-2">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-800">
                                {reservation?.guestName || preReg?.name || 'Reserva Airbnb'}
                              </p>
                              <p className="text-xs text-gray-500">{event.reservationCode}</p>
                            </div>
                            {reservation ? (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                Cadastrado
                              </span>
                            ) : preReg ? (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                                Pré-cadastro
                              </span>
                            ) : (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                Sem cadastro
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <ClockIcon className="h-4 w-4 text-gray-400" />
                            {formatDate(event.start)} → {formatDate(event.end)}
                          </div>
                          {!preReg && event.summary !== 'Airbnb (Not available)' && (
                            <button
                              onClick={() => handleCreatePreRegistration(event)}
                              className="mt-3 flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
                            >
                              <UserPlusIcon className="h-4 w-4" />
                              Criar Pré-cadastro
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
