'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarIcon,
  ArrowLeftIcon,
  UsersIcon,
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Reservation {
  _id: string;
  checkInDate: string;
  checkOutDate: string;
  guests: {
    name: string;
    age: number;
    document?: string;
  }[];
  vehiclePlates: {
    brand?: string;
    model?: string;
    color?: string;
    plate?: string;
  }[];
  status?: 'confirmed' | 'pending' | 'cancelled';
  specialRequests?: string;
  createdAt: string;
}

export default function ReservasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(
    null
  );

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchReservations();
    }
  }, [status, router]);

  const fetchReservations = async () => {
    try {
      const response = await fetch('/api/user/reservations');
      const data = await response.json();

      if (response.ok) {
        setReservations(data.reservations || []);
      }
    } catch (error) {
      toast.error('Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusInfo = (reservation: Reservation) => {
    const now = new Date();
    const checkIn = new Date(reservation.checkInDate);
    const checkOut = new Date(reservation.checkOutDate);

    if (reservation.status === 'cancelled') {
      return {
        label: 'Cancelada',
        color: 'bg-red-100 text-red-800',
        icon: XCircleIcon,
      };
    }

    if (now >= checkIn && now <= checkOut) {
      return {
        label: 'Em andamento',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircleIcon,
      };
    }

    if (now < checkIn) {
      return {
        label: 'Confirmada',
        color: 'bg-blue-100 text-blue-800',
        icon: ClockIcon,
      };
    }

    return {
      label: 'Concluída',
      color: 'bg-gray-100 text-gray-800',
      icon: CheckCircleIcon,
    };
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/hospede"
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Minhas Reservas</h1>
            <p className="text-gray-600">Histórico e detalhes das suas estadias</p>
          </div>
        </div>

        {/* Reservations List */}
        <div className="space-y-4">
          {reservations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Nenhuma reserva encontrada
              </h3>
              <p className="text-gray-500 mb-4">
                Você ainda não possui reservas registradas no sistema
              </p>
              <Link
                href="/contato"
                className="inline-block px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Fazer uma Reserva
              </Link>
            </div>
          ) : (
            reservations.map((reservation) => {
              const statusInfo = getStatusInfo(reservation);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={reservation._id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  {/* Reservation Header */}
                  <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <CalendarIcon className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {formatDate(reservation.checkInDate)} -{' '}
                          {formatDate(reservation.checkOutDate)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {calculateNights(
                            reservation.checkInDate,
                            reservation.checkOutDate
                          )}{' '}
                          noites
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusInfo.color}`}
                    >
                      <StatusIcon className="h-4 w-4" />
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Reservation Details */}
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Guests */}
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <UsersIcon className="h-4 w-4" />
                          Hóspedes ({reservation.guests?.length || 0})
                        </div>
                        {reservation.guests && reservation.guests.length > 0 ? (
                          <ul className="space-y-1">
                            {reservation.guests.map((guest, index) => (
                              <li
                                key={index}
                                className="text-sm text-gray-700 flex items-center gap-2"
                              >
                                <span className="w-2 h-2 bg-amber-400 rounded-full" />
                                {guest.name}{' '}
                                <span className="text-gray-400">
                                  ({guest.age} anos)
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-400">
                            Nenhum hóspede adicional
                          </p>
                        )}
                      </div>

                      {/* Vehicles */}
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <TruckIcon className="h-4 w-4" />
                          Veículos ({reservation.vehiclePlates?.length || 0})
                        </div>
                        {reservation.vehiclePlates &&
                        reservation.vehiclePlates.length > 0 ? (
                          <ul className="space-y-1">
                            {reservation.vehiclePlates.map((vehicle, index) => (
                              <li
                                key={index}
                                className="text-sm text-gray-700 flex items-center gap-2"
                              >
                                <span className="w-2 h-2 bg-green-400 rounded-full" />
                                {vehicle.brand} {vehicle.model}{' '}
                                <span className="text-gray-500">
                                  ({vehicle.plate})
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-400">
                            Nenhum veículo cadastrado
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Special Requests */}
                    {reservation.specialRequests && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-500 mb-1">
                          Observações:
                        </p>
                        <p className="text-sm text-gray-700">
                          {reservation.specialRequests}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-4 py-3 bg-gray-50 flex justify-end gap-2">
                    <button
                      onClick={() => setSelectedReservation(reservation)}
                      className="px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Details Modal */}
        {selectedReservation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Detalhes da Reserva
                </h2>
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-amber-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="h-5 w-5 text-amber-600" />
                    <span className="font-medium text-gray-800">Período</span>
                  </div>
                  <p className="text-gray-600">
                    Check-in: {formatDate(selectedReservation.checkInDate)}
                  </p>
                  <p className="text-gray-600">
                    Check-out: {formatDate(selectedReservation.checkOutDate)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {calculateNights(
                      selectedReservation.checkInDate,
                      selectedReservation.checkOutDate
                    )}{' '}
                    noites
                  </p>
                </div>

                {selectedReservation.guests &&
                  selectedReservation.guests.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                        <UsersIcon className="h-5 w-5" />
                        Hóspedes
                      </h3>
                      <ul className="space-y-2">
                        {selectedReservation.guests.map((guest, index) => (
                          <li
                            key={index}
                            className="bg-gray-50 rounded-lg p-3"
                          >
                            <p className="font-medium text-gray-800">
                              {guest.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {guest.age} anos
                              {guest.document && ` • Doc: ${guest.document}`}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {selectedReservation.vehiclePlates &&
                  selectedReservation.vehiclePlates.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                        <TruckIcon className="h-5 w-5" />
                        Veículos
                      </h3>
                      <ul className="space-y-2">
                        {selectedReservation.vehiclePlates.map(
                          (vehicle, index) => (
                            <li
                              key={index}
                              className="bg-gray-50 rounded-lg p-3"
                            >
                              <p className="font-medium text-gray-800">
                                {vehicle.brand} {vehicle.model}
                              </p>
                              <p className="text-sm text-gray-500">
                                {vehicle.color} • Placa: {vehicle.plate}
                              </p>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {selectedReservation.specialRequests && (
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">
                      Observações
                    </h3>
                    <p className="text-gray-600 bg-gray-50 rounded-lg p-3">
                      {selectedReservation.specialRequests}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedReservation(null)}
                className="w-full mt-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
