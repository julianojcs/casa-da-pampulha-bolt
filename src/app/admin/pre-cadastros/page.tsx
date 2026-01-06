'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  LinkIcon,
  ClipboardIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  CalendarIcon,
  UserPlusIcon,
  XMarkIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { formatPhone } from '@/lib/helpers';
import { IPreRegistration } from '@/models/PreRegistration';
import { formatLocalDate, toLocalDateInputValue } from '@/utils/dateUtils';

interface CalendarEvent {
  uid: string;
  summary: string;
  start: string;
  end: string;
  status: string;
  reservationCode?: string;
}

export default function PreCadastrosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [preRegistrations, setPreRegistrations] = useState<IPreRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IPreRegistration | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<string>('');
  const [initializedFromParams, setInitializedFromParams] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    expirationDays: 30,
    checkInDate: '',
    checkInTime: '15:00',
    checkOutDate: '',
    checkOutTime: '11:00',
    adultsCount: 1,
    childrenCount: 0,
    babiesCount: 0,
    petsCount: 0,
    reservationValue: 0,
    reservationValueRaw: '',
    hasReviews: false,
    isHost: false,
    originCountry: '',
    reservationCode: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    fetchPreRegistrations();
  }, [statusFilter]);

  // Handle URL params for creating from calendar
  useEffect(() => {
    if (initializedFromParams) return;

    const create = searchParams.get('create');
    const checkInDate = searchParams.get('checkInDate');
    const checkOutDate = searchParams.get('checkOutDate');
    const reservationCode = searchParams.get('reservationCode');

    if (create === 'true' && checkInDate && checkOutDate) {
      setInitializedFromParams(true);
      // Pre-fill form data
      setFormData((prev) => ({
        ...prev,
        checkInDate,
        checkOutDate,
        notes: reservationCode ? `Código da reserva: ${reservationCode}` : '',
      }));
      // Fetch calendar events and open modal
      fetchCalendarEvents();
      setIsModalOpen(true);
      // Clear URL params
      router.replace('/admin/pre-cadastros', { scroll: false });
    }
  }, [searchParams, initializedFromParams, router]);

  const fetchCalendarEvents = async () => {
    setLoadingCalendar(true);
    try {
      const response = await fetch('/api/calendar');
      const data = await response.json();
      if (response.ok && data.events) {
        // Filter only future events that have a reservationCode
        const today = toLocalDateInputValue(new Date());
        const futureEvents = data.events.filter(
          (e: CalendarEvent) => toLocalDateInputValue(e.start) >= today && e.reservationCode
        );

        // Also fetch pre-registrations to filter out already registered events
        const preRegResponse = await fetch('/api/pre-registration');
        const preRegData = await preRegResponse.json();

        // Filter out events that already have a pre-registration with matching dates
        const unregisteredEvents = futureEvents.filter((event: CalendarEvent) => {
          const eventStart = toLocalDateInputValue(event.start);
          const eventEnd = toLocalDateInputValue(event.end);

          // Check if any pre-registration matches these dates
          const hasPreReg = preRegData.some((pr: any) => {
            const prStart = toLocalDateInputValue(pr.checkInDate);
            const prEnd = toLocalDateInputValue(pr.checkOutDate);
            return prStart === eventStart && prEnd === eventEnd;
          });

          return !hasPreReg;
        });

        setCalendarEvents(unregisteredEvents);
      }
    } catch (error) {
      console.error('Erro ao carregar calendário:', error);
    } finally {
      setLoadingCalendar(false);
    }
  };

  const handleReservationSelect = (uid: string) => {
    setSelectedReservation(uid);
    if (!uid) return;

    const event = calendarEvents.find((e) => e.uid === uid);
    if (event) {
      // Auto-fill form with calendar event data
      const guestName = event.summary.replace(/^Reserved$|^Reservado$/i, '').trim() || '';

      setFormData((prev) => ({
        ...prev,
        name: guestName || prev.name,
        checkInDate: event.start,
        checkOutDate: event.end,
        reservationCode: event.reservationCode || '',
      }));
    }
  };

  const fetchPreRegistrations = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/pre-registration?${params}`);
      const data = await response.json();

      if (response.ok) {
        setPreRegistrations(data);
      }
    } catch (error) {
      toast.error('Erro ao carregar pré-cadastros');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast.error('Nome e telefone são obrigatórios');
      return;
    }

    // Validar datas
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (formData.checkInDate) {
      const checkIn = new Date(formData.checkInDate);
      if (checkIn < today) {
        toast.error('Data de check-in não pode ser anterior a hoje');
        return;
      }
    }

    if (formData.checkOutDate) {
      const checkOut = new Date(formData.checkOutDate);
      if (checkOut < today) {
        toast.error('Data de check-out não pode ser anterior a hoje');
        return;
      }

      if (formData.checkInDate && new Date(formData.checkOutDate) <= new Date(formData.checkInDate)) {
        toast.error('Data de check-out deve ser posterior à data de check-in');
        return;
      }
    }

    try {
      const method = editingItem ? 'PUT' : 'POST';

      // Parse reservationValue from raw input if provided (accept comma)
      const raw = typeof formData.reservationValueRaw === 'string' && formData.reservationValueRaw.trim() !== ''
        ? formData.reservationValueRaw
        : String(formData.reservationValue || '0');
      const reservationValueNumeric = parseFloat(raw.replace(',', '.').replace(/[^0-9.\-]/g, '')) || 0;

      const bodyData = { ...formData, reservationValue: reservationValueNumeric };
      const body = editingItem ? { id: editingItem._id, ...bodyData } : bodyData;

      const response = await fetch('/api/pre-registration', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          editingItem
            ? 'Pré-cadastro atualizado!'
            : 'Pré-cadastro criado! Link gerado.'
        );
        fetchPreRegistrations();
        closeModal();

        // Se for novo, mostrar o link
        if (!editingItem && data.registrationLink) {
          navigator.clipboard.writeText(data.registrationLink);
          toast.success('Link copiado para a área de transferência!', {
            duration: 5000,
          });
        }
      } else {
        toast.error(data.error || 'Erro ao salvar');
      }
    } catch (error) {
      toast.error('Erro ao salvar pré-cadastro');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este pré-cadastro?')) return;

    try {
      const response = await fetch(`/api/pre-registration?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Pré-cadastro excluído');
        fetchPreRegistrations();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erro ao excluir');
      }
    } catch (error) {
      toast.error('Erro ao excluir pré-cadastro');
    }
  };

  const copyLink = (token: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    const link = `${baseUrl}/cadastro?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(token);
    toast.success('Link copiado!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openModal = (item?: IPreRegistration) => {
    if (item) {
      setEditingItem(item);
      setSelectedReservation('');
      setFormData({
        name: item.name,
        email: item.email || '',
        phone: item.phone,
        notes: item.notes || '',
        expirationDays: 30,
        checkInDate: item.checkInDate ? toLocalDateInputValue(item.checkInDate) : '',
        checkInTime: item.checkInTime || '15:00',
        checkOutDate: item.checkOutDate ? toLocalDateInputValue(item.checkOutDate) : '',
        checkOutTime: item.checkOutTime || '11:00',
        adultsCount: item.adultsCount || 1,
        childrenCount: item.childrenCount || 0,
        babiesCount: item.babiesCount || 0,
        petsCount: item.petsCount || 0,
        reservationValue: item.reservationValue || 0,
        reservationValueRaw: item.reservationValue ? String(item.reservationValue).replace('.', ',') : '',
        hasReviews: item.hasReviews || false,
        isHost: item.isHost || false,
        originCountry: item.originCountry || '',
        reservationCode: item.reservationCode || '',
      });
    } else {
      setEditingItem(null);
      setSelectedReservation('');
      // Fetch calendar events for new pre-registrations
      fetchCalendarEvents();
      setFormData({
        name: '',
        email: '',
        phone: '',
        notes: '',
        expirationDays: 30,
        checkInDate: '',
        checkInTime: '15:00',
        checkOutDate: '',
        checkOutTime: '11:00',
        adultsCount: 1,
        childrenCount: 0,
        babiesCount: 0,
        petsCount: 0,
        reservationValue: 0,
        reservationValueRaw: '',
        hasReviews: false,
        isHost: false,
        originCountry: '',
        reservationCode: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({
        name: '',
        email: '',
        phone: '',
        notes: '',
        expirationDays: 30,
        checkInDate: '',
        checkInTime: '15:00',
        checkOutDate: '',
        checkOutTime: '11:00',
        adultsCount: 1,
        childrenCount: 0,
        babiesCount: 0,
        petsCount: 0,
        reservationValue: 0,
        reservationValueRaw: '',
        hasReviews: false,
        isHost: false,
        originCountry: '',
        reservationCode: '',
    });
    setSelectedReservation('');
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      registered: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      pending: 'Pendente',
      registered: 'Cadastrado',
      expired: 'Expirado',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const filteredItems = preRegistrations.filter(
    (item) =>
      // Excluir itens com status 'registered' - eles aparecem na página de hóspedes
      item.status !== 'registered' &&
      (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.includes(searchTerm) ||
      (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Pré-Cadastros</h1>
            <p className="text-gray-600">
              Gerencie os convites de cadastro para hóspedes
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <UserPlusIcon className="h-5 w-5" />
            Novo Pré-Cadastro
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
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
              <option value="expired">Expirados</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-yellow-700">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {preRegistrations.filter((p) => p.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <XMarkIcon className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-red-700">Expirados</p>
                <p className="text-2xl font-bold text-red-800">
                  {preRegistrations.filter((p) => p.status === 'expired').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">
                    Hóspede
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">
                    Contato
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">
                    Check-in / Check-out
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">
                    Expira em
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-500">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      {searchTerm
                        ? 'Nenhum resultado encontrado'
                        : 'Nenhum pré-cadastro criado ainda'}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-800">{item.name}</p>
                          {item.notes && (
                            <p className="text-xs text-gray-500 mt-1">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <PhoneIcon className="h-4 w-4" />
                            {item.phone}
                          </div>
                          {item.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <EnvelopeIcon className="h-4 w-4" />
                              {item.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-600 space-y-1">
                          {item.checkInDate ? (
                            <>
                              <div>
                                <span className="text-xs text-gray-500">In: </span>
                                {formatLocalDate(item.checkInDate, { day: '2-digit', month: '2-digit', year: 'numeric' })} {item.checkInTime}
                              </div>
                              {item.checkOutDate && (
                                <div>
                                  <span className="text-xs text-gray-500">Out: </span>
                                  {formatLocalDate(item.checkOutDate, { day: '2-digit', month: '2-digit', year: 'numeric' })} {item.checkOutTime}
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">{getStatusBadge(item.status)}</td>
                      <td className="py-4 px-6">
                        {item.status === 'pending' ? (
                          <span className="text-sm text-gray-600">
                            {formatLocalDate(item.expiresAt, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          {item.status === 'pending' && (
                            <button
                              onClick={() => copyLink(item.token)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Copiar link de cadastro"
                            >
                              {copiedId === item.token ? (
                                <CheckIcon className="h-5 w-5 text-green-600" />
                              ) : (
                                <LinkIcon className="h-5 w-5" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => openModal(item)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id!)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
            {filteredItems.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                {searchTerm
                  ? 'Nenhum resultado encontrado'
                  : 'Nenhum pré-cadastro criado ainda'}
              </div>
            ) : (
              filteredItems.map((item) => (
                <div key={item._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-800 truncate">{item.name}</p>
                        {getStatusBadge(item.status)}
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <PhoneIcon className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{item.phone}</span>
                        </div>
                        {item.email && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <EnvelopeIcon className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{item.email}</span>
                          </div>
                        )}
                        {item.checkInDate && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                            <span>
                              {formatLocalDate(item.checkInDate, { day: '2-digit', month: '2-digit', year: 'numeric' })} {item.checkInTime}
                              {item.checkOutDate && ` → ${formatLocalDate(item.checkOutDate, { day: '2-digit', month: '2-digit', year: 'numeric' })} ${item.checkOutTime}`}
                            </span>
                          </div>
                        )}
                        {item.status === 'pending' && (
                          <div className="flex items-center gap-2 text-gray-500">
                            <ClockIcon className="h-4 w-4 flex-shrink-0" />
                            <span>Expira: {formatLocalDate(item.expiresAt, { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                          </div>
                        )}
                        {item.notes && (
                          <p className="text-xs text-gray-500 italic mt-1">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {item.status === 'pending' && (
                        <button
                          onClick={() => copyLink(item.token)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Copiar link"
                        >
                          {copiedId === item.token ? (
                            <CheckIcon className="h-5 w-5 text-green-600" />
                          ) : (
                            <LinkIcon className="h-5 w-5" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => openModal(item)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id!)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-800">
                {editingItem ? 'Editar Pré-Cadastro' : 'Novo Pré-Cadastro'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Airbnb Calendar Selector - Only show for new pre-registrations */}
              {!editingItem && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDaysIcon className="h-5 w-5 text-amber-600" />
                    <label className="block text-sm font-medium text-amber-800">
                      Importar do Calendário
                    </label>
                  </div>
                  {loadingCalendar ? (
                    <div className="flex items-center gap-2 text-amber-600 text-sm">
                      <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      Carregando reservas...
                    </div>
                  ) : calendarEvents.length > 0 ? (
                    <select
                      value={selectedReservation}
                      onChange={(e) => handleReservationSelect(e.target.value)}
                      className="w-full px-4 py-2 border border-amber-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    >
                      <option value="">Selecione uma reserva para preencher automaticamente...</option>
                      {calendarEvents.map((event) => (
                        <option key={event.uid} value={event.uid}>
                          {formatLocalDate(event.start, { day: '2-digit', month: '2-digit', year: 'numeric' })} - {formatLocalDate(event.end, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          {event.summary !== 'Reserved' && event.summary !== 'Reservado' ? ` • ${event.summary}` : ''}
                          {event.reservationCode ? ` (${event.reservationCode})` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-amber-600 text-sm">
                      Nenhuma reserva futura encontrada no calendário ou calendário não configurado.
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Hóspede *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone (WhatsApp) *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: formatPhone(e.target.value) })
                  }
                  placeholder="+55 (27) 9XXXX-XXXX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (opcional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* Código de Reserva */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Reserva
                </label>
                <input
                  type="text"
                  value={formData.reservationCode}
                  onChange={(e) =>
                    setFormData({ ...formData, reservationCode: e.target.value })
                  }
                  disabled={!!selectedReservation}
                  placeholder="Ex: HM2AJENN4J"
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${selectedReservation ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
              </div>

              {/* Check-in */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Check-in
                  </label>
                  <input
                    type="date"
                    value={formData.checkInDate}
                    onChange={(e) =>
                      setFormData({ ...formData, checkInDate: e.target.value })
                    }
                    disabled={!!selectedReservation}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${selectedReservation ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora Check-in
                  </label>
                  <input
                    type="time"
                    value={formData.checkInTime}
                    onChange={(e) =>
                      setFormData({ ...formData, checkInTime: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Check-out */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Check-out
                  </label>
                  <input
                    type="date"
                    value={formData.checkOutDate}
                    onChange={(e) =>
                      setFormData({ ...formData, checkOutDate: e.target.value })
                    }
                    disabled={!!selectedReservation}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${selectedReservation ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora Check-out
                  </label>
                  <input
                    type="time"
                    value={formData.checkOutTime}
                    onChange={(e) =>
                      setFormData({ ...formData, checkOutTime: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Quantidade de hóspedes */}
              {/* Quantidade de hóspedes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adultos
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.adultsCount}
                    onChange={(e) =>
                      setFormData({ ...formData, adultsCount: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Crianças
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.childrenCount}
                    onChange={(e) =>
                      setFormData({ ...formData, childrenCount: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bebês
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.babiesCount}
                    onChange={(e) =>
                      setFormData({ ...formData, babiesCount: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pets
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.petsCount}
                    onChange={(e) =>
                      setFormData({ ...formData, petsCount: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Valor e País */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor da Reserva (R$)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.reservationValueRaw}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const numeric = parseFloat(raw.replace(',', '.').replace(/[^0-9.\-]/g, '')) || 0;
                      setFormData({ ...formData, reservationValueRaw: raw, reservationValue: numeric });
                    }}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    País de Origem
                  </label>
                  <select
                    value={formData.originCountry}
                    onChange={(e) =>
                      setFormData({ ...formData, originCountry: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">Selecione...</option>
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
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasReviews}
                    onChange={(e) =>
                      setFormData({ ...formData, hasReviews: e.target.checked })
                    }
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-700">Tem avaliações</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isHost}
                    onChange={(e) =>
                      setFormData({ ...formData, isHost: e.target.checked })
                    }
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-700">É anfitrião</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ex: aniversário, alergia..."
                />
              </div>

              {!editingItem && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Validade do link (dias)
                  </label>
                  <select
                    value={formData.expirationDays}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expirationDays: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value={7}>7 dias</option>
                    <option value={15}>15 dias</option>
                    <option value={30}>30 dias</option>
                    <option value={60}>60 dias</option>
                    <option value={90}>90 dias</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  {editingItem ? 'Atualizar' : 'Criar e Gerar Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
