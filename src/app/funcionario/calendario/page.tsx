'use client';

import { useEffect, useState } from 'react';
import { ArrowPathIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import ReservationCalendar, { CalendarEvent, Reservation } from '@/components/ReservationCalendar';

export default function CalendarioPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    fetchCalendar();
  }, []);

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const [calRes, reservationsRes] = await Promise.all([
        fetch('/api/calendar'),
        fetch('/api/reservations'),
      ]);

      if (calRes.ok) {
        const data = await calRes.json();
        setEvents(data.events || []);
        setLastSync(data.lastSync || null);
      }

      if (reservationsRes.ok) {
        const reservationsData = await reservationsRes.json();
        setReservations(reservationsData.reservations || reservationsData || []);
      }
    } catch (error) {
      console.error('Erro ao buscar calendário:', error);
    } finally {
      setLoading(false);
    }
  };

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
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 text-sm font-medium disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Calendar Component */}
      <ReservationCalendar
        events={events}
        reservations={reservations}
        viewMode="staff"
        loading={loading}
        lastSync={lastSync}
      />

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
