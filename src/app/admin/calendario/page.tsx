'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowPathIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ReservationCalendar, { CalendarEvent, PreRegistration, Reservation } from '@/components/ReservationCalendar';

export default function CalendarioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [preRegistrations, setPreRegistrations] = useState<PreRegistration[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

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

  const handleCreatePreRegistration = (event: CalendarEvent) => {
    const params = new URLSearchParams({
      checkInDate: event.start,
      checkOutDate: event.end,
      reservationCode: event.reservationCode || '',
    });
    router.push(`/admin/pre-cadastros?create=true&${params.toString()}`);
  };

  if (status === 'loading' || (loading && events.length === 0)) {
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
        </div>
      </div>

      {/* Calendar Component */}
      <ReservationCalendar
        events={events}
        preRegistrations={preRegistrations}
        reservations={reservations}
        viewMode="admin"
        loading={loading}
        lastSync={lastSync}
        onCreatePreRegistration={handleCreatePreRegistration}
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
              As informações são atualizadas a cada hora. Clique em &ldquo;Sincronizar&rdquo; para atualizar manualmente.
            </p>
          </div>
        </div>
      </div>

      {/* Legend for Admin */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-medium text-gray-800 mb-4">Legenda de Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <span className="text-gray-600">Reservado (sem pré-cadastro)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-600">Pré-cadastro parcial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600">Pré-cadastro completo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-zinc-200 border border-zinc-300" />
            <span className="text-gray-600">Bloqueado (Airbnb)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
