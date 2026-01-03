'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CalendarDaysIcon,
  UserIcon,
  PhoneIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { formatPhone } from '@/lib/helpers';
import { IReservation, ReservationStatus, ReservationSource } from '@/types';

interface ReservationWithGuest extends IReservation {
  guest?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
}

interface Guest {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  avatar?: string;
}

const emptyForm = {
  userId: '',
  guestName: '',
  guestEmail: '',
  guestPhone: '',
  guestCountry: 'Brasil',
  checkInDate: '',
  checkInTime: '15:00',
  checkOutDate: '',
  checkOutTime: '11:00',
  numberOfGuests: 1,
  notes: '',
  source: 'direct' as ReservationSource,
  reservationCode: '',
  totalAmount: 0,
  totalAmountRaw: '',
  isPaid: false,
  temporaryMainDoorPassword: {
    location: '',
    password: '',
    notes: '',
  },
};

export default function ReservasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [reservations, setReservations] = useState<ReservationWithGuest[]>([]);
  const [currentReservation, setCurrentReservation] = useState<ReservationWithGuest | null>(null);
  const [nextReservation, setNextReservation] = useState<ReservationWithGuest | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [periodFilter, setPeriodFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IReservation | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [detailsModal, setDetailsModal] = useState<ReservationWithGuest | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchReservations();
      fetchCurrentReservation();
      fetchGuests();
    }
  }, [status, statusFilter, periodFilter]);

  const fetchReservations = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (periodFilter) params.append('period', periodFilter);

      const response = await fetch(`/api/reservations?${params}`);
      const data = await response.json();

      if (response.ok) {
        setReservations(data);
      }
    } catch (error) {
      toast.error('Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentReservation = async () => {
    try {
      const response = await fetch('/api/reservations/current');
      const data = await response.json();

      if (response.ok) {
        setCurrentReservation(data.current);
        setNextReservation(data.next);
      }
    } catch (error) {
      console.error('Erro ao buscar reserva atual:', error);
    }
  };

  const fetchGuests = async () => {
    try {
      const response = await fetch('/api/guests');
      const data = await response.json();
      if (Array.isArray(data)) {
        setGuests(data.map((g: any) => ({
          _id: g._id,
          name: g.name,
          email: g.email,
          phone: g.phone,
          country: g.country,
          avatar: g.avatar,
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar hóspedes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userId || !formData.checkInDate || !formData.checkOutDate) {
      toast.error('Hóspede, check-in e check-out são obrigatórios');
      return;
    }

    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);

    if (checkOut <= checkIn) {
      toast.error('Data de check-out deve ser posterior ao check-in');
      return;
    }

    setSaving(true);

    try {
      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem
        ? `/api/reservations?id=${editingItem._id}`
        : '/api/reservations';

      // Ensure totalAmount is a numeric value (accept comma as decimal separator)
      const raw = typeof formData.totalAmountRaw === 'string' && formData.totalAmountRaw.trim() !== ''
        ? formData.totalAmountRaw
        : String(formData.totalAmount || '0');
      const numeric = parseFloat(raw.replace(',', '.').replace(/[^0-9.\-]/g, '')) || 0;

      const payload = { ...formData, totalAmount: numeric };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(editingItem ? 'Reserva atualizada!' : 'Reserva criada!');
        fetchReservations();
        fetchCurrentReservation();
        closeModal();
      } else {
        toast.error(data.error || 'Erro ao salvar');
      }
    } catch (error) {
      toast.error('Erro ao salvar reserva');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta reserva?')) return;

    try {
      const response = await fetch(`/api/reservations?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Reserva excluída');
        fetchReservations();
        fetchCurrentReservation();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erro ao excluir');
      }
    } catch (error) {
      toast.error('Erro ao excluir reserva');
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) return;

    try {
      const response = await fetch(`/api/reservations?id=${id}&cancel=true`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Reserva cancelada');
        fetchReservations();
        fetchCurrentReservation();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erro ao cancelar');
      }
    } catch (error) {
      toast.error('Erro ao cancelar reserva');
    }
  };

  const openModal = (item?: IReservation) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        userId: item.userId,
        guestName: item.guestName,
        guestEmail: item.guestEmail || '',
        guestPhone: item.guestPhone,
        guestCountry: item.guestCountry || 'Brasil',
        checkInDate: item.checkInDate ? new Date(item.checkInDate).toISOString().split('T')[0] : '',
        checkInTime: item.checkInTime || '15:00',
        checkOutDate: item.checkOutDate ? new Date(item.checkOutDate).toISOString().split('T')[0] : '',
        checkOutTime: item.checkOutTime || '11:00',
        numberOfGuests: item.numberOfGuests || 1,
        notes: item.notes || '',
        source: item.source || 'direct',
        reservationCode: item.reservationCode || '',
        totalAmount: item.totalAmount || 0,
        totalAmountRaw: item.totalAmount ? String(item.totalAmount).replace('.', ',') : '',
        isPaid: item.isPaid || false,
        temporaryMainDoorPassword: {
          location: item.temporaryMainDoorPassword?.location || '',
          password: item.temporaryMainDoorPassword?.password || '',
          notes: item.temporaryMainDoorPassword?.notes || '',
        },
      });
    } else {
      setEditingItem(null);
      setFormData(emptyForm);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(emptyForm);
  };

  const handleGuestSelect = (guestId: string) => {
    const guest = guests.find(g => g._id === guestId);
    if (guest) {
      setFormData({
        ...formData,
        userId: guest._id,
        guestName: guest.name,
        guestEmail: guest.email,
        guestPhone: guest.phone || '',
        guestCountry: guest.country || 'Brasil',
      });
    }
  };

  const getStatusBadge = (status: ReservationStatus) => {
    const styles: Record<ReservationStatus, string> = {
      pending: 'bg-amber-100 text-amber-800',
      upcoming: 'bg-blue-100 text-blue-800',
      current: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    const labels: Record<ReservationStatus, string> = {
      pending: 'Pendente',
      upcoming: 'Próxima',
      current: 'Em andamento',
      completed: 'Concluída',
      cancelled: 'Cancelada',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatDate = (date: Date | string) => {
    // Extract just the date part (YYYY-MM-DD) to avoid timezone issues
    const dateStr = typeof date === 'string' ? date : date.toISOString();
    const datePart = dateStr.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    return localDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getDaysRemaining = (date: Date | string) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset to start of day

    // Extract just the date part (YYYY-MM-DD) to avoid timezone issues
    const dateStr = typeof date === 'string' ? date : date.toISOString();
    const datePart = dateStr.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    const target = new Date(year, month - 1, day); // Create local date
    target.setHours(0, 0, 0, 0);

    const diff = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const filteredReservations = reservations.filter((item) => {
    const matchSearch =
      item.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.guestPhone?.includes(searchTerm) ||
      item.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reservas</h1>
          <p className="text-gray-600">Gerencie as reservas da propriedade</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Nova Reserva
        </button>
      </div>

      {/* Reserva Atual (Hero) */}
      {currentReservation && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDaysIcon className="h-6 w-6" />
            <h2 className="text-xl font-bold">Reserva em Andamento</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              {currentReservation.guest?.avatar ? (
                <Image
                  src={currentReservation.guest.avatar}
                  alt={currentReservation.guestName}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/30"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <UserIcon className="h-8 w-8" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold">{currentReservation.guestName}</h3>
                <p className="text-amber-100 flex items-center gap-1">
                  <PhoneIcon className="h-4 w-4" />
                  {formatPhone(currentReservation.guestPhone)}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5" />
                <span>
                  Check-in: {formatDate(currentReservation.checkInDate)} às {currentReservation.checkInTime}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5" />
                <span>
                  Check-out: {formatDate(currentReservation.checkOutDate)} às {currentReservation.checkOutTime}
                </span>
              </div>
              {currentReservation.numberOfGuests && (
                <p className="text-amber-100">
                  {currentReservation.numberOfGuests} hóspede(s)
                </p>
              )}
            </div>
          </div>
          {getDaysRemaining(currentReservation.checkOutDate) <= 1 && (
            <div className="mt-4 bg-white/20 rounded-lg p-3 text-sm">
              ⚠️ Check-out {getDaysRemaining(currentReservation.checkOutDate) === 0 ? 'hoje' : 'amanhã'}!
            </div>
          )}
        </div>
      )}

      {/* Próxima Reserva */}
      {!currentReservation && nextReservation && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDaysIcon className="h-6 w-6" />
            <h2 className="text-xl font-bold">Próxima Reserva</h2>
            <span className="text-blue-100 text-sm">
              (em {getDaysRemaining(nextReservation.checkInDate)} dias)
            </span>
          </div>
          <div className="flex items-center gap-4">
            {nextReservation.guest?.avatar ? (
              <Image
                src={nextReservation.guest.avatar}
                alt={nextReservation.guestName}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <UserIcon className="h-6 w-6" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold">{nextReservation.guestName}</h3>
              <p className="text-blue-100">
                {formatDate(nextReservation.checkInDate)} - {formatDate(nextReservation.checkOutDate)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sem reservas */}
      {!currentReservation && !nextReservation && (
        <div className="bg-gray-100 rounded-2xl p-6 text-center">
          <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h2 className="text-lg font-medium text-gray-600">Nenhuma reserva ativa</h2>
          <p className="text-gray-500">Crie uma nova reserva para começar</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">Todos os status</option>
            <option value="pending">Pendentes</option>
            <option value="upcoming">Próximas</option>
            <option value="current">Em andamento</option>
            <option value="completed">Concluídas</option>
            <option value="cancelled">Canceladas</option>
          </select>
          <button
            onClick={() => {
              fetchReservations();
              fetchCurrentReservation();
            }}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-amber-700">
            {reservations.filter(r => r.status === 'pending').length}
          </div>
          <div className="text-sm text-amber-600">Pendentes</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-700">
            {reservations.filter(r => r.status === 'current').length}
          </div>
          <div className="text-sm text-green-600">Em andamento</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-700">
            {reservations.filter(r => r.status === 'upcoming').length}
          </div>
          <div className="text-sm text-blue-600">Próximas</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-gray-700">
            {reservations.filter(r => r.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Concluídas</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-red-700">
            {reservations.filter(r => r.status === 'cancelled').length}
          </div>
          <div className="text-sm text-red-600">Canceladas</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Hóspede
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Check-in
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Check-out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Origem
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    {searchTerm
                      ? 'Nenhum resultado encontrado'
                      : 'Nenhuma reserva encontrada'}
                  </td>
                </tr>
              ) : (
                filteredReservations.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setDetailsModal(item)}
                          className="relative group cursor-pointer"
                          title="Ver detalhes da reserva"
                        >
                          {item.guest?.avatar ? (
                            <Image
                              src={item.guest.avatar}
                              alt={item.guestName}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-amber-400 transition-all"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-medium ring-2 ring-transparent group-hover:ring-amber-400 transition-all">
                              {item.guestName?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
                              <MagnifyingGlassIcon className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        </button>
                        <div>
                          <div className="font-medium text-gray-900">{item.guestName}</div>
                          <div className="text-sm text-gray-500">{formatPhone(item.guestPhone)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{formatDate(item.checkInDate)}</div>
                      <div className="text-sm text-gray-500">{item.checkInTime}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{formatDate(item.checkOutDate)}</div>
                      <div className="text-sm text-gray-500">{item.checkOutTime}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 capitalize">
                        {item.source || 'Direto'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openModal(item)}
                          className="p-2 text-gray-400 hover:text-amber-600 transition-colors"
                          title="Editar"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        {item.status === 'upcoming' && (
                          <button
                            onClick={() => handleCancel(item._id!)}
                            className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                            title="Cancelar"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item._id!)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Excluir"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredReservations.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              {searchTerm
                ? 'Nenhum resultado encontrado'
                : 'Nenhuma reserva encontrada'}
            </div>
          ) : (
            filteredReservations.map((item) => (
              <div key={item._id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    {item.guest?.avatar ? (
                      <Image
                        src={item.guest.avatar}
                        alt={item.guestName}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-medium">
                        {item.guestName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{item.guestName}</div>
                      <div className="text-sm text-gray-500">{formatPhone(item.guestPhone)}</div>
                    </div>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
                <div className="text-sm text-gray-600 space-y-1 mb-3">
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="h-4 w-4" />
                    <span>
                      {formatDate(item.checkInDate)} - {formatDate(item.checkOutDate)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => openModal(item)}
                    className="p-2 text-gray-400 hover:text-amber-600"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  {item.status === 'upcoming' && (
                    <button
                      onClick={() => handleCancel(item._id!)}
                      className="p-2 text-gray-400 hover:text-orange-600"
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item._id!)}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-6 pb-4 border-b flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-800">
                {editingItem ? 'Editar Reserva' : 'Nova Reserva'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form id="reserva-form" onSubmit={handleSubmit} className="space-y-4 p-6 pt-4 overflow-y-auto flex-1">
              {/* Seleção de Hóspede */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hóspede *
                </label>
                <select
                  value={formData.userId}
                  onChange={(e) => handleGuestSelect(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um hóspede</option>
                  {guests.map((guest) => (
                    <option key={guest._id} value={guest._id}>
                      {guest.name} - {guest.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nome e Telefone (preenchidos automaticamente) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={formData.guestName}
                    onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={formData.guestPhone}
                    onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>
              </div>

              {/* País de Origem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  País de Origem
                </label>
                <select
                  value={formData.guestCountry}
                  onChange={(e) => setFormData({ ...formData, guestCountry: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="Brasil">Brasil</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Chile">Chile</option>
                  <option value="Colombia">Colômbia</option>
                  <option value="Mexico">México</option>
                  <option value="Peru">Peru</option>
                  <option value="Uruguai">Uruguai</option>
                  <option value="Paraguai">Paraguai</option>
                  <option value="Estados Unidos">Estados Unidos</option>
                  <option value="Canadá">Canadá</option>
                  <option value="Portugal">Portugal</option>
                  <option value="Espanha">Espanha</option>
                  <option value="França">França</option>
                  <option value="Itália">Itália</option>
                  <option value="Alemanha">Alemanha</option>
                  <option value="Reino Unido">Reino Unido</option>
                  <option value="Holanda">Holanda</option>
                  <option value="Suíça">Suíça</option>
                  <option value="Japão">Japão</option>
                  <option value="China">China</option>
                  <option value="Coreia do Sul">Coreia do Sul</option>
                  <option value="Austrália">Austrália</option>
                  <option value="Nova Zelândia">Nova Zelândia</option>
                  <option value="África do Sul">África do Sul</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              {/* Check-in */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Check-in *
                  </label>
                  <input
                    type="date"
                    value={formData.checkInDate}
                    onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário
                  </label>
                  <input
                    type="time"
                    value={formData.checkInTime}
                    onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Check-out */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Check-out *
                  </label>
                  <input
                    type="date"
                    value={formData.checkOutDate}
                    onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário
                  </label>
                  <input
                    type="time"
                    value={formData.checkOutTime}
                    onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Número de hóspedes e Origem */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nº de Hóspedes
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.numberOfGuests}
                    onChange={(e) => setFormData({ ...formData, numberOfGuests: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Origem
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="airbnb">Airbnb</option>
                    <option value="direct">Direto</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
              </div>

              {/* Código de confirmação */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código da Reserva
                </label>
                <input
                  type="text"
                  value={formData.reservationCode}
                  onChange={(e) => setFormData({ ...formData, reservationCode: e.target.value })}
                  placeholder="Ex: HMXYZ123"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* Senha Temporária da Porta Principal */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  🔐 Senha Temporária da Porta Principal
                </h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Local</label>
                    <input
                      type="text"
                      value={formData.temporaryMainDoorPassword.location}
                      onChange={(e) => setFormData({
                        ...formData,
                        temporaryMainDoorPassword: {
                          ...formData.temporaryMainDoorPassword,
                          location: e.target.value,
                        }
                      })}
                      placeholder="Ex: Porta Principal"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Senha</label>
                    <input
                      type="text"
                      value={formData.temporaryMainDoorPassword.password}
                      onChange={(e) => setFormData({
                        ...formData,
                        temporaryMainDoorPassword: {
                          ...formData.temporaryMainDoorPassword,
                          password: e.target.value,
                        }
                      })}
                      placeholder="Ex: 1234#"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Observações</label>
                  <input
                    type="text"
                    value={formData.temporaryMainDoorPassword.notes}
                    onChange={(e) => setFormData({
                      ...formData,
                      temporaryMainDoorPassword: {
                        ...formData.temporaryMainDoorPassword,
                        notes: e.target.value,
                      }
                    })}
                    placeholder="Ex: Válido apenas durante a estadia"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Valor e Pagamento */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor Total (R$)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.totalAmountRaw}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const numeric = parseFloat(raw.replace(',', '.').replace(/[^0-9.\-]/g, '')) || 0;
                      setFormData({ ...formData, totalAmountRaw: raw, totalAmount: numeric });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPaid}
                      onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                      className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                    />
                    <span className="text-sm text-gray-700">Pago</span>
                  </label>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ex: 3 pessoas, aniversário..."
                />
              </div>

            </form>

            <div className="flex gap-3 p-6 pt-4 border-t flex-shrink-0">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="reserva-form"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Salvando...' : editingItem ? 'Atualizar' : 'Criar Reserva'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reservation Details Modal */}
      {detailsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden">
            <div className="relative h-32 bg-gradient-to-br from-amber-500 to-orange-600">
              <button
                onClick={() => setDetailsModal(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-white" />
              </button>
              <div className="absolute -bottom-10 left-6">
                {detailsModal.guest?.avatar ? (
                  <Image
                    src={detailsModal.guest.avatar}
                    alt={detailsModal.guestName}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-xl border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl border-4 border-white shadow-lg bg-amber-100 flex items-center justify-center text-amber-700 text-2xl font-bold">
                    {detailsModal.guestName?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-14 px-6 pb-6">
              <h3 className="text-xl font-bold text-gray-800">{detailsModal.guestName}</h3>
              <p className="text-gray-500 text-sm">{detailsModal.guestEmail}</p>

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <span>{formatPhone(detailsModal.guestPhone)}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <span>{formatDate(detailsModal.checkInDate)}</span>
                    <span className="mx-2 text-gray-400">→</span>
                    <span>{formatDate(detailsModal.checkOutDate)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                  <span>Check-in: {detailsModal.checkInTime} | Check-out: {detailsModal.checkOutTime}</span>
                </div>

                {((detailsModal as any).guests?.length) && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                    <span>{(detailsModal as any).guests?.length} hóspede(s)</span>
                  </div>
                )}

                {detailsModal.reservationCode && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <span className="text-gray-400 text-sm">Código:</span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">{detailsModal.reservationCode}</span>
                  </div>
                )}

                {detailsModal.temporaryMainDoorPassword?.password && (
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                    <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
                      🔐 Senha da porta: {detailsModal.temporaryMainDoorPassword.location}
                    </div>
                    <div className="font-mono text-lg text-amber-800 mt-1">
                      {detailsModal.temporaryMainDoorPassword.password}
                    </div>
                    {detailsModal.temporaryMainDoorPassword.notes && (
                      <div className="text-xs text-amber-600 mt-1">{detailsModal.temporaryMainDoorPassword.notes}</div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                {getStatusBadge(detailsModal.status)}
                <span className="text-sm text-gray-500 capitalize">{detailsModal.source || 'Direto'}</span>
              </div>

              {detailsModal.notes && (
                <div className="mt-4 bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">{detailsModal.notes}</p>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setDetailsModal(null);
                    openModal(detailsModal);
                  }}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                >
                  Editar Reserva
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
