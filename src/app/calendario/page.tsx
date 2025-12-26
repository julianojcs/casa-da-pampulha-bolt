'use client';

import { useState, useEffect, useMemo } from 'react';
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface CalendarEvent {
  uid: string;
  summary: string;
  start: string;
  end: string;
  status: 'blocked' | 'available';
}

interface CalendarData {
  events: CalendarEvent[];
  totalEvents: number;
  lastSync: string;
  calendarUrl: string | null;
  message?: string;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function CalendarioPage() {
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  useEffect(() => {
    async function fetchCalendar() {
      try {
        setLoading(true);
        const res = await fetch('/api/calendar');
        if (!res.ok) throw new Error('Falha ao carregar calendário');
        const data = await res.json();
        setCalendarData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }
    fetchCalendar();
  }, []);

  const blockedDates = useMemo(() => {
    if (!calendarData?.events) return new Set<string>();
    const blocked = new Set<string>();
    for (const event of calendarData.events) {
      // Add all dates between start and end (exclusive of end for iCal semantics)
      const start = new Date(event.start);
      const end = new Date(event.end);
      const current = new Date(start);
      while (current < end) {
        blocked.add(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    }
    return blocked;
  }, [calendarData]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  const today = new Date().toISOString().split('T')[0];

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="bg-gradient-to-br from-amber-600 to-amber-700 text-white py-16">
        <div className="container-section py-0">
          <div className="flex items-center gap-3 mb-4">
            <CalendarDaysIcon className="h-10 w-10" />
            <h1 className="text-4xl md:text-5xl font-bold">Calendário de Disponibilidade</h1>
          </div>
          <p className="text-lg text-amber-100">
            Verifique as datas disponíveis para sua reserva
          </p>
          {calendarData?.lastSync && (
            <p className="text-sm text-amber-200 mt-2">
              Última sincronização: {new Date(calendarData.lastSync).toLocaleString('pt-BR')}
            </p>
          )}
        </div>
      </section>

      {/* Calendar Section */}
      <section className="container-section">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <ExclamationCircleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <p className="text-gray-600">{error}</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Legend */}
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
                <div className="w-6 h-6 bg-amber-100 border-2 border-amber-500 rounded"></div>
                <span className="text-gray-700">Hoje</span>
              </div>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Mês anterior"
              >
                <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
              </button>

              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h2>
                <button
                  onClick={goToToday}
                  className="text-sm text-amber-600 hover:text-amber-700 mt-1"
                >
                  Ir para hoje
                </button>
              </div>

              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Próximo mês"
              >
                <ChevronRightIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Day Headers */}
              <div className="grid grid-cols-7 bg-gray-50 border-b">
                {DAY_NAMES.map((day) => (
                  <div key={day} className="py-3 text-center font-semibold text-gray-600 text-sm">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="h-14 md:h-20 bg-gray-50" />;
                  }

                  const dateStr = formatDate(currentYear, currentMonth, day);
                  const isBlocked = blockedDates.has(dateStr);
                  const isToday = dateStr === today;
                  const isPast = dateStr < today;

                  let bgColor = 'bg-green-50 hover:bg-green-100';
                  let borderColor = 'border-green-200';
                  let textColor = 'text-gray-800';

                  if (isBlocked) {
                    bgColor = 'bg-red-50';
                    borderColor = 'border-red-200';
                    textColor = 'text-red-700';
                  } else if (isPast) {
                    bgColor = 'bg-gray-50';
                    borderColor = 'border-gray-200';
                    textColor = 'text-gray-400';
                  }

                  if (isToday) {
                    bgColor = isBlocked ? 'bg-red-100' : 'bg-amber-100';
                    borderColor = 'border-amber-400';
                  }

                  return (
                    <div
                      key={dateStr}
                      className={`h-14 md:h-20 border ${borderColor} ${bgColor} flex flex-col items-center justify-center transition-colors ${textColor}`}
                    >
                      <span className={`text-lg font-semibold ${isToday ? 'text-amber-700' : ''}`}>
                        {day}
                      </span>
                      {isBlocked && (
                        <span className="text-xs text-red-500 hidden md:block">Reservado</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            {calendarData && (
              <div className="mt-8 text-center text-gray-600">
                <p>
                  {calendarData.totalEvents} período(s) reservado(s) a partir de hoje
                </p>
              </div>
            )}

            {/* CTA */}
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">
                Encontrou datas disponíveis? Faça sua reserva!
              </p>
              <Link
                href="https://www.airbnb.com.br/rooms/1028115044709052736"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.001 18.275c-.942-1.298-1.796-2.63-2.343-4.053-.469-1.212-.685-2.298-.685-3.343 0-2.17 1.398-3.881 3.028-3.881 1.63 0 3.028 1.711 3.028 3.881 0 1.045-.216 2.131-.685 3.343-.547 1.423-1.401 2.755-2.343 4.053zm0 2.482c1.616-2.198 2.848-4.218 3.625-5.958.64-1.423.959-2.817.959-4.12 0-3.283-2.039-5.881-4.584-5.881-2.545 0-4.584 2.598-4.584 5.881 0 1.303.319 2.697.959 4.12.777 1.74 2.009 3.76 3.625 5.958z"/>
                </svg>
                Reservar no Airbnb
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
