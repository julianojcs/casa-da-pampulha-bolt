'use client';

import { useState, useEffect } from 'react';
import { CalendarDaysIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import ReservationCalendar, { CalendarEvent, Reservation } from '@/components/ReservationCalendar';

interface CalendarData {
  events: CalendarEvent[];
  totalEvents: number;
  lastSync: string;
  calendarUrl: string | null;
  message?: string;
}

export default function CalendarioPage() {
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCalendar() {
      try {
        setLoading(true);
        const [calRes, reservationsRes] = await Promise.all([
          fetch('/api/calendar'),
          fetch('/api/reservations/public'),
        ]);

        if (!calRes.ok) throw new Error('Falha ao carregar calendário');
        const data = await calRes.json();
        setCalendarData(data);

        if (reservationsRes.ok) {
          const reservationsData = await reservationsRes.json();
          setReservations(reservationsData.reservations || reservationsData || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }
    fetchCalendar();
  }, []);

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
        {error ? (
          <div className="text-center py-16">
            <ExclamationCircleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <p className="text-gray-600">{error}</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <ReservationCalendar
              events={calendarData?.events || []}
              reservations={reservations}
              viewMode="public"
              loading={loading}
              lastSync={calendarData?.lastSync}
            />

            {/* Stats */}
            {calendarData && !loading && (
              <div className="mt-8 text-center text-gray-600">
                <p>
                  {calendarData.totalEvents} período(s) reservado(s) a partir de hoje
                </p>
              </div>
            )}

            {/* CTA */}
            {!loading && (
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
            )}
          </div>
        )}
      </section>
    </div>
  );
}
