'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface CalendarEvent {
  uid: string;
  summary: string;
  start: string;
  end: string;
  status: 'blocked' | 'available';
}

export default function CalendarioPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchCalendar();
  }, []);

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/calendar');
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
        setLastSync(data.lastSync || null);
      }
    } catch (error) {
      console.error('Erro ao buscar calendário:', error);
    } finally {
      setLoading(false);
    }
  };

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [currentDate]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter((event) => {
      return dateStr >= event.start && dateStr < event.end;
    });
  };

  // Get check-ins (reservations starting on this date)
  const getCheckInsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter((event) => event.start === dateStr);
  };

  // Get check-outs (reservations ending on this date)
  const getCheckOutsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter((event) => event.end === dateStr);
  };

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

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
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

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
            Calendário de Reservas
          </h1>
          <p className="text-slate-500 mt-1">
            Sincronizado com Airbnb
            {lastSync && (
              <span className="ml-2 text-xs text-slate-400">
                • Última atualização: {new Date(lastSync).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-center">
          <button
            onClick={fetchCalendar}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 text-sm font-medium"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Atualizar
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 text-sm font-medium"
          >
            Hoje
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Month Navigation */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5 text-slate-600" />
            </button>
            <h2 className="text-lg font-semibold text-slate-800">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {weekDays.map((day) => (
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
                    className="min-h-[80px] lg:min-h-[100px] border-r border-b border-slate-50 bg-slate-25"
                  />
                );
              }

              const dayEvents = getEventsForDate(date);
              const checkIns = getCheckInsForDate(date);
              const checkOuts = getCheckOutsForDate(date);
              const isBlocked = dayEvents.length > 0;
              const hasCheckIn = checkIns.length > 0;
              const hasCheckOut = checkOuts.length > 0;

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`min-h-[80px] lg:min-h-[100px] p-2 border-r border-b border-slate-50 text-left transition-colors ${
                    isSelected(date)
                      ? 'bg-emerald-50 hover:bg-emerald-100'
                      : isBlocked
                      ? 'bg-rose-50 hover:bg-rose-100'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col h-full">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full ${
                        isToday(date)
                          ? 'bg-emerald-500 text-white'
                          : isSelected(date)
                          ? 'bg-emerald-200 text-emerald-800'
                          : isBlocked
                          ? 'text-rose-700'
                          : 'text-slate-700'
                      }`}
                    >
                      {date.getDate()}
                    </span>

                    <div className="flex-1 mt-1 space-y-1">
                      {hasCheckIn && (
                        <div className="flex items-center gap-1">
                          <ArrowTrendingUpIcon className="h-3 w-3 text-emerald-500" />
                          <span className="text-[10px] text-emerald-600 font-medium truncate">
                            Entrada
                          </span>
                        </div>
                      )}
                      {hasCheckOut && (
                        <div className="flex items-center gap-1">
                          <ArrowRightIcon className="h-3 w-3 text-rose-500 rotate-45" />
                          <span className="text-[10px] text-rose-600 font-medium truncate">
                            Saída
                          </span>
                        </div>
                      )}
                      {isBlocked && !hasCheckIn && !hasCheckOut && (
                        <div className="flex items-center gap-1">
                          <UserGroupIcon className="h-3 w-3 text-rose-500" />
                          <span className="text-[10px] text-rose-600 font-medium truncate">
                            Ocupado
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
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
        </div>

        {/* Selected Day Details */}
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
          ) : selectedDateEvents.length === 0 &&
            selectedDateCheckIns.length === 0 &&
            selectedDateCheckOuts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <CalendarDaysIcon className="h-8 w-8 text-emerald-600" />
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
                    {selectedDateCheckIns.map((event) => (
                      <div
                        key={event.uid}
                        className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-xs">
                            <UserGroupIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 text-sm">
                              {event.summary || 'Reserva'}
                            </p>
                            <p className="text-xs text-slate-500">
                              Até {new Date(event.end).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-600">
                          <ClockIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">15:00</span>
                        </div>
                      </div>
                    ))}
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
                    {selectedDateCheckOuts.map((event) => (
                      <div
                        key={event.uid}
                        className="flex items-center justify-between p-3 bg-rose-50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-semibold text-xs">
                            <UserGroupIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 text-sm">
                              {event.summary || 'Reserva'}
                            </p>
                            <p className="text-xs text-slate-500">
                              Desde {new Date(event.start).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-rose-600">
                          <ClockIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">11:00</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Currently Staying */}
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
                        <p className="text-xs text-slate-500">Hóspedes na casa</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {selectedDateEvents.map((event) => (
                        <div
                          key={event.uid}
                          className="p-3 bg-rose-50 rounded-xl"
                        >
                          <p className="font-medium text-slate-800 text-sm mb-1">
                            {event.summary || 'Reserva'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(event.start).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                            {' → '}
                            {new Date(event.end).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <CalendarDaysIcon className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-blue-800 mb-1">Sincronização com Airbnb</h3>
            <p className="text-sm text-blue-700">
              Este calendário é sincronizado automaticamente com as reservas do Airbnb.
              As informações são atualizadas a cada hora.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
