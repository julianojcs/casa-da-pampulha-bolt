'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  UserGroupIcon,
  TruckIcon,
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  XMarkIcon,
  UserIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Guest {
  _id?: string;
  name: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  documentType?: 'cpf' | 'rg' | 'passport' | 'other';
  documentNumber?: string;
  isMainGuest?: boolean;
}

interface Vehicle {
  _id?: string;
  brand: string;
  model: string;
  color: string;
  licensePlate: string;
}

interface Reservation {
  _id: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  guests?: Guest[];
  vehicles?: Vehicle[];
}

const emptyGuest: Guest = {
  name: '',
  gender: undefined,
  age: undefined,
  documentType: 'cpf',
  documentNumber: '',
  isMainGuest: false,
};

const emptyVehicle: Vehicle = {
  brand: '',
  model: '',
  color: '',
  licensePlate: '',
};

const genderLabels: Record<string, string> = {
  male: 'Masculino',
  female: 'Feminino',
  other: 'Outro',
};

const documentTypeLabels: Record<string, string> = {
  cpf: 'CPF',
  rg: 'RG',
  passport: 'Passaporte',
  other: 'Outro',
};

export default function ConvidadosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingGuests, setEditingGuests] = useState<Guest[]>([]);
  const [editingVehicles, setEditingVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchReservations();
    }
  }, [status]);

  const fetchReservations = async () => {
    try {
      const res = await fetch('/api/user/reservations');
      const data = await res.json();
      if (res.ok && data.reservations) {
        const activeReservations = data.reservations.filter(
          (r: Reservation) => r.status === 'current' || r.status === 'upcoming' || r.status === 'pending'
        );
        setReservations(activeReservations);

        if (activeReservations.length === 1) {
          selectReservation(activeReservations[0]);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
      toast.error('Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  };

  const selectReservation = async (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsEditing(false);

    try {
      const res = await fetch(`/api/user/reservations/${reservation._id}/guests`);
      if (res.ok) {
        const data = await res.json();
        const existingGuests = data.guests || [];
        const existingVehicles = data.vehicles || [];

        const hasMainGuest = existingGuests.some((g: Guest) => g.isMainGuest);

        if (!hasMainGuest) {
          const mainGuest: Guest = {
            name: reservation.guestName,
            isMainGuest: true,
          };
          setGuests([mainGuest, ...existingGuests]);
        } else {
          setGuests(existingGuests);
        }

        setVehicles(existingVehicles);
      } else {
        const hasMainGuest = (reservation.guests || []).some(g => g.isMainGuest);
        if (!hasMainGuest) {
          const mainGuest: Guest = {
            name: reservation.guestName,
            isMainGuest: true,
          };
          setGuests([mainGuest, ...(reservation.guests || [])]);
        } else {
          setGuests(reservation.guests || []);
        }
        setVehicles(reservation.vehicles || []);
      }
    } catch (error) {
      console.error('Erro ao buscar hóspedes:', error);
      const hasMainGuest = (reservation.guests || []).some(g => g.isMainGuest);
      if (!hasMainGuest) {
        const mainGuest: Guest = {
          name: reservation.guestName,
          isMainGuest: true,
        };
        setGuests([mainGuest, ...(reservation.guests || [])]);
      } else {
        setGuests(reservation.guests || []);
      }
      setVehicles(reservation.vehicles || []);
    }
  };

  const startEditing = () => {
    setEditingGuests([...guests]);
    setEditingVehicles([...vehicles]);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingGuests([]);
    setEditingVehicles([]);
  };

  const addGuest = () => {
    setEditingGuests([...editingGuests, { ...emptyGuest }]);
  };

  const removeGuest = (index: number) => {
    if (editingGuests[index]?.isMainGuest) {
      toast.error('O hóspede principal não pode ser removido');
      return;
    }
    setEditingGuests(editingGuests.filter((_, i) => i !== index));
  };

  const updateGuest = (index: number, field: keyof Guest, value: string | number | boolean) => {
    if (editingGuests[index]?.isMainGuest) {
      toast.error('Os dados do hóspede principal não podem ser editados');
      return;
    }
    const updated = [...editingGuests];
    updated[index] = { ...updated[index], [field]: value };
    setEditingGuests(updated);
  };

  const addVehicle = () => {
    if (editingVehicles.length >= 5) {
      toast.error('Máximo de 5 veículos permitidos');
      return;
    }
    setEditingVehicles([...editingVehicles, { ...emptyVehicle }]);
  };

  const removeVehicle = (index: number) => {
    setEditingVehicles(editingVehicles.filter((_, i) => i !== index));
  };

  const updateVehicle = (index: number, field: keyof Vehicle, value: string) => {
    const updated = [...editingVehicles];
    updated[index] = { ...updated[index], [field]: value };
    setEditingVehicles(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReservation) return;

    for (const guest of editingGuests) {
      if (!guest.name.trim()) {
        toast.error('Todos os hóspedes devem ter nome');
        return;
      }
    }

    for (const vehicle of editingVehicles) {
      if (!vehicle.brand || !vehicle.model || !vehicle.color || !vehicle.licensePlate) {
        toast.error('Todos os campos do veículo são obrigatórios');
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/user/reservations/${selectedReservation._id}/guests`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guests: editingGuests, vehicles: editingVehicles }),
      });

      if (res.ok) {
        toast.success('Informações salvas com sucesso!');
        setGuests(editingGuests);
        setVehicles(editingVehicles);
        setIsEditing(false);
      } else {
        const error = await res.json();
        toast.error(error.message || 'Erro ao salvar');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar informações');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/hospede"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-xl transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Meus Convidados</h1>
            <p className="text-slate-500 mt-1">Gerencie hóspedes e veículos da sua reserva</p>
          </div>
        </div>

        {/* No active reservations */}
        {reservations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-slate-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-700 mb-2">Nenhuma reserva ativa</h2>
            <p className="text-slate-500 mb-6">
              Você não possui reservas ativas ou próximas para cadastrar hóspedes.
            </p>
            <Link
              href="/hospede/reservas"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-medium"
            >
              Ver minhas reservas
            </Link>
          </div>
        ) : (
          <>
            {/* Reservation Selector (if multiple) */}
            {reservations.length > 1 && !selectedReservation && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Selecione uma reserva</h2>
                <div className="space-y-3">
                  {reservations.map((reservation) => (
                    <button
                      key={reservation._id}
                      onClick={() => selectReservation(reservation)}
                      className="w-full flex items-center justify-between p-4 border-2 border-slate-100 rounded-xl hover:border-amber-400 hover:bg-amber-50/50 transition-all"
                    >
                      <div className="text-left">
                        <p className="font-semibold text-slate-800">{reservation.guestName}</p>
                        <p className="text-sm text-slate-500">
                          {formatDate(reservation.checkInDate)} → {formatDate(reservation.checkOutDate)}
                        </p>
                      </div>
                      <span className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                        reservation.status === 'current'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {reservation.status === 'current' ? 'Em andamento' : 'Próxima'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            {selectedReservation && (
              <>
                {/* Selected Reservation Info */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-100 text-sm font-medium">Reserva selecionada</p>
                      <p className="text-xl font-bold mt-1">{selectedReservation.guestName}</p>
                      <p className="text-amber-100 mt-1">
                        {formatDate(selectedReservation.checkInDate)} → {formatDate(selectedReservation.checkOutDate)}
                      </p>
                    </div>
                    {reservations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setSelectedReservation(null)}
                        className="text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-colors font-medium"
                      >
                        Trocar
                      </button>
                    )}
                  </div>
                </div>

                {/* VIEW MODE */}
                {!isEditing && (
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Guests Card */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <UserGroupIcon className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <h2 className="font-semibold text-slate-800">Hóspedes</h2>
                            <p className="text-xs text-slate-500">{guests.length} pessoa{guests.length !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <button
                          onClick={startEditing}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors font-medium"
                        >
                          <PencilIcon className="h-4 w-4" />
                          Editar
                        </button>
                      </div>

                      <div className="p-5">
                        {guests.length === 0 ? (
                          <div className="text-center py-6 text-slate-400">
                            <UserIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Nenhum hóspede cadastrado</p>
                            <button
                              onClick={startEditing}
                              className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                              + Adicionar hóspedes
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {guests.map((guest, index) => (
                              <div key={index} className={`p-3 rounded-xl ${guest.isMainGuest ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50'}`}>
                                <div className="flex items-start gap-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${guest.isMainGuest ? 'bg-amber-200 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>
                                    {guest.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium text-slate-800 truncate">{guest.name}</p>
                                      {guest.isMainGuest && (
                                        <span className="px-2 py-0.5 bg-amber-200 text-amber-800 rounded text-xs font-medium whitespace-nowrap">
                                          Principal
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {guest.gender && (
                                        <span className="text-xs text-slate-500">{genderLabels[guest.gender]}</span>
                                      )}
                                      {guest.age && (
                                        <span className="text-xs text-slate-500">{guest.age} anos</span>
                                      )}
                                      {guest.documentNumber && (
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                          <IdentificationIcon className="h-3 w-3" />
                                          {documentTypeLabels[guest.documentType || 'cpf']}: {guest.documentNumber}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Vehicles Card */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            <TruckIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h2 className="font-semibold text-slate-800">Veículos</h2>
                            <p className="text-xs text-slate-500">{vehicles.length} veículo{vehicles.length !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <button
                          onClick={startEditing}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                        >
                          <PencilIcon className="h-4 w-4" />
                          Editar
                        </button>
                      </div>

                      <div className="p-5">
                        {vehicles.length === 0 ? (
                          <div className="text-center py-6 text-slate-400">
                            <TruckIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Nenhum veículo cadastrado</p>
                            <button
                              onClick={startEditing}
                              className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              + Adicionar veículos
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {vehicles.map((vehicle, index) => (
                              <div key={index} className="p-3 rounded-xl bg-slate-50">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-blue-200 text-blue-700 flex items-center justify-center">
                                    <TruckIcon className="h-5 w-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-800">
                                      {vehicle.brand} {vehicle.model}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      <span className="text-xs text-slate-500">{vehicle.color}</span>
                                      <span className="text-xs font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                                        {vehicle.licensePlate}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* EDIT MODE */}
                {isEditing && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Guests Section */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <UserGroupIcon className="h-5 w-5 text-emerald-600" />
                          </div>
                          <h2 className="font-semibold text-slate-800">Hóspedes</h2>
                        </div>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <XMarkIcon className="h-4 w-4" />
                          Cancelar
                        </button>
                      </div>

                      <div className="p-5 space-y-4">
                        {editingGuests.map((guest, index) => (
                          <div key={index} className={`border-2 rounded-xl p-4 ${guest.isMainGuest ? 'border-amber-300 bg-amber-50/50' : 'border-slate-200'}`}>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-700">
                                  Hóspede {index + 1}
                                </span>
                                {guest.isMainGuest && (
                                  <span className="px-2 py-0.5 bg-amber-200 text-amber-800 rounded text-xs font-medium">
                                    Principal
                                  </span>
                                )}
                              </div>
                              {!guest.isMainGuest && (
                                <button
                                  type="button"
                                  onClick={() => removeGuest(index)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              )}
                            </div>

                            {guest.isMainGuest ? (
                              <div className="text-slate-700">
                                <p className="font-medium text-lg">{guest.name}</p>
                                <p className="text-sm text-slate-500 mt-1">Dados do hóspede principal não podem ser editados aqui.</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Nome completo *</label>
                                  <input
                                    type="text"
                                    value={guest.name}
                                    onChange={(e) => updateGuest(index, 'name', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    required
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Sexo</label>
                                  <select
                                    value={guest.gender || ''}
                                    onChange={(e) => updateGuest(index, 'gender', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                  >
                                    <option value="">Selecione</option>
                                    <option value="male">Masculino</option>
                                    <option value="female">Feminino</option>
                                    <option value="other">Outro</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Idade</label>
                                  <input
                                    type="number"
                                    value={guest.age || ''}
                                    onChange={(e) => updateGuest(index, 'age', parseInt(e.target.value) || 0)}
                                    min="0"
                                    max="120"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Tipo de documento</label>
                                  <select
                                    value={guest.documentType || 'cpf'}
                                    onChange={(e) => updateGuest(index, 'documentType', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                  >
                                    <option value="cpf">CPF</option>
                                    <option value="rg">RG</option>
                                    <option value="passport">Passaporte</option>
                                    <option value="other">Outro</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Número do documento</label>
                                  <input
                                    type="text"
                                    value={guest.documentNumber || ''}
                                    onChange={(e) => updateGuest(index, 'documentNumber', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={addGuest}
                          className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-emerald-300 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors font-medium"
                        >
                          <PlusIcon className="h-5 w-5" />
                          Adicionar hóspede
                        </button>
                      </div>
                    </div>

                    {/* Vehicles Section */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            <TruckIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h2 className="font-semibold text-slate-800">Veículos</h2>
                            <p className="text-xs text-slate-500">Máximo 5 veículos</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 space-y-4">
                        {editingVehicles.map((vehicle, index) => (
                          <div key={index} className="border-2 border-slate-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-sm font-semibold text-slate-700">
                                Veículo {index + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeVehicle(index)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1.5">Marca *</label>
                                <input
                                  type="text"
                                  value={vehicle.brand}
                                  onChange={(e) => updateVehicle(index, 'brand', e.target.value)}
                                  placeholder="Fiat"
                                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1.5">Modelo *</label>
                                <input
                                  type="text"
                                  value={vehicle.model}
                                  onChange={(e) => updateVehicle(index, 'model', e.target.value)}
                                  placeholder="Uno"
                                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1.5">Cor *</label>
                                <input
                                  type="text"
                                  value={vehicle.color}
                                  onChange={(e) => updateVehicle(index, 'color', e.target.value)}
                                  placeholder="Branco"
                                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1.5">Placa *</label>
                                <input
                                  type="text"
                                  value={vehicle.licensePlate}
                                  onChange={(e) => updateVehicle(index, 'licensePlate', e.target.value.toUpperCase())}
                                  placeholder="ABC-1234"
                                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={addVehicle}
                          disabled={editingVehicles.length >= 5}
                          className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <PlusIcon className="h-5 w-5" />
                          {editingVehicles.length >= 5 ? 'Limite de veículos atingido' : 'Adicionar veículo'}
                        </button>
                      </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors font-medium"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="h-5 w-5" />
                            Salvar informações
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
