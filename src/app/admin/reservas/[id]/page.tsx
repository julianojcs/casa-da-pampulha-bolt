'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserGroupIcon,
  MapPinIcon,
  KeyIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

interface Reservation {
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
  numberOfGuests?: number;
  temporaryMainDoorPassword?: {
    location: string;
    password: string;
    notes?: string;
  };
  totalAmount?: number;
  isPaid?: boolean;
  notes?: string;
  guests?: { name: string; age?: number }[];
  vehicles?: { brand: string; model: string; color: string; licensePlate: string }[];
  guest?: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
}

export default function ReservationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchReservation = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/reservations/${id}`);

        if (!res.ok) {
          throw new Error('Reserva não encontrada');
        }

        const data = await res.json();
        setReservation(data.reservation || data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar reserva');
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [id]);

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '';

    try {
      // If the input is a string like 'YYYY-MM-DDTHH:mm:ss.sssZ' or with offset,
      // extract the date portion (YYYY-MM-DD) and build a local Date from it.
      // This avoids timezone shifts (e.g. midnight UTC showing as previous day).
      let dt: Date;

      if (typeof date === 'string') {
        const match = date.match(/^(\d{4}-\d{2}-\d{2})/);
        if (match) {
          const [y, m, d] = match[1].split('-').map(Number);
          dt = new Date(y, m - 1, d);
        } else {
          dt = new Date(date);
        }
      } else {
        dt = date;
      }

      return dt.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch (err) {
      return String(date);
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return '';
    return time;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: 'Pendente', class: 'bg-amber-100 text-amber-700' },
      upcoming: { label: 'Próxima', class: 'bg-blue-100 text-blue-700' },
      current: { label: 'Em andamento', class: 'bg-green-100 text-green-700' },
      completed: { label: 'Concluída', class: 'bg-gray-100 text-gray-700' },
      cancelled: { label: 'Cancelada', class: 'bg-red-100 text-red-700' },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.class}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <InformationCircleIcon className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Reserva não encontrada</h2>
          <p className="text-gray-600 mb-6">{error || 'A reserva solicitada não existe ou foi removida.'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Voltar
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Detalhes da Reserva</h1>
              {reservation.reservationCode && (
                <p className="text-gray-500 mt-1">Código: {reservation.reservationCode}</p>
              )}
            </div>
            {getStatusBadge(reservation.status)}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Hero Section */}
          <div className="relative h-48 bg-gradient-to-r from-amber-500 to-orange-600">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-end gap-4">
                {reservation.guest?.avatar ? (
                  <Image
                    src={reservation.guest.avatar}
                    alt={reservation.guestName}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-xl border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-white/20 border-4 border-white flex items-center justify-center">
                    <UserIcon className="h-10 w-10 text-white" />
                  </div>
                )}
                <div className="flex-1 pb-2">
                  <h2 className="text-2xl font-bold text-white">{reservation.guestName}</h2>
                  {reservation.guestCountry && (
                    <p className="text-white/90 text-sm">{reservation.guestCountry}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Contact Info */}
            <div className="grid md:grid-cols-2 gap-4">
              {reservation.guestPhone && (
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <PhoneIcon className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Telefone</p>
                    <p className="font-medium">{reservation.guestPhone}</p>
                  </div>
                </div>
              )}
              {reservation.guestEmail && (
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <EnvelopeIcon className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">E-mail</p>
                    <p className="font-medium">{reservation.guestEmail}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="bg-amber-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <CalendarDaysIcon className="h-5 w-5 text-amber-600" />
                Período da Estadia
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Check-in</p>
                  <p className="font-medium text-gray-800">{formatDate(reservation.checkInDate)}</p>
                  {reservation.checkInTime && (
                    <p className="text-sm text-gray-600">às {formatTime(reservation.checkInTime)}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Check-out</p>
                  <p className="font-medium text-gray-800">{formatDate(reservation.checkOutDate)}</p>
                  {reservation.checkOutTime && (
                    <p className="text-sm text-gray-600">até {formatTime(reservation.checkOutTime)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Guest Count & Source */}
            <div className="grid md:grid-cols-2 gap-4">
              {reservation.numberOfGuests && (
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserGroupIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Número de Hóspedes</p>
                    <p className="font-medium">{reservation.guests?.length} pessoa(s)</p>
                  </div>
                </div>
              )}
              {reservation.source && (
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <MapPinIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Origem da Reserva</p>
                    <p className="font-medium capitalize">{reservation.source}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Temporary Password */}
            {reservation.temporaryMainDoorPassword?.password && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <KeyIcon className="h-5 w-5 text-emerald-600" />
                  Senha Temporária
                </h3>
                <div className="space-y-2">
                  {reservation.temporaryMainDoorPassword.location && (
                    <div>
                      <p className="text-xs text-gray-500">Local</p>
                      <p className="font-medium text-gray-800">{reservation.temporaryMainDoorPassword.location}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500">Senha</p>
                    <p className="text-2xl font-bold text-emerald-700 tracking-wider">
                      {reservation.temporaryMainDoorPassword.password}
                    </p>
                  </div>
                  {reservation.temporaryMainDoorPassword.notes && (
                    <div className="mt-2 text-sm text-gray-600 bg-white/50 rounded-lg p-2">
                      💡 {reservation.temporaryMainDoorPassword.notes}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {reservation.notes && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <InformationCircleIcon className="h-5 w-5 text-gray-600" />
                  Observações
                </h3>
                <p className="text-gray-700">{reservation.notes}</p>
              </div>
            )}

            {/* Payment Info */}
            {reservation.totalAmount !== undefined && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Valor Total</p>
                    <p className="text-2xl font-bold text-gray-800">
                      R$ {reservation.totalAmount.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  {reservation.isPaid !== undefined && (
                    <div>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                        reservation.isPaid
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {reservation.isPaid ? '✓ Pago' : 'Pendente'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Casa da Pampulha</p>
          <p className="mt-1">Para mais informações, entre em contato com o anfitrião</p>
        </div>
      </div>
    </div>
  );
}
