 'use client';

import { useEffect, useState } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { onlyDigits, formatCPF, validateCPF, formatPhone, validateEmail } from '../../../lib/helpers';
import { fetchStates, fetchCitiesByStateSigla, type IBGEState, type IBGECity } from '@/lib/ibge';
import { CloudinaryUpload } from '@/components/CloudinaryUpload';
import { CLOUDINARY_FOLDERS } from '@/lib/cloudinary';

interface Guest {
  _id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  documentType: string;
  nationality: string;
  birthDate: string;
  address: string;
  city: string;
  state: string;
  country: string;
  checkInDate: string;
  checkOutDate: string;
  notes: string;
  avatar?: string;
  agreedToRules?: boolean;
  isActive: boolean;
  createdAt: string;
}

const emptyGuest: Omit<Guest, '_id' | 'createdAt'> = {
  name: '',
  email: '',
  phone: '',
  document: '',
  documentType: 'CPF',
  nationality: 'Brasileiro(a)',
  birthDate: '',
  address: '',
  city: '',
  state: '',
  country: 'Brasil',
  checkInDate: '',
  checkOutDate: '',
  notes: '',
  avatar: '',
  agreedToRules: true,
  isActive: true,
};

export default function AdminHospedesPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingGuest, setViewingGuest] = useState<Guest | null>(null);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState<Omit<Guest, '_id' | 'createdAt'>>(emptyGuest);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [states, setStates] = useState<IBGEState[]>([]);
  const [cities, setCities] = useState<IBGECity[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    fetchGuests();
    loadStates();
  }, []);

  const loadStates = async () => {
    try {
      setLoadingStates(true);
      const data = await fetchStates();
      setStates(data);
    } catch (err) {
      console.error('Erro ao carregar estados do IBGE', err);
      toast.error('Erro ao carregar lista de estados');
    } finally {
      setLoadingStates(false);
    }
  };

  const loadCitiesForState = async (stateSigla: string) => {
    try {
      setLoadingCities(true);
      if (!stateSigla) {
        setCities([]);
        return;
      }
      const data = await fetchCitiesByStateSigla(states, stateSigla);
      setCities(data);
    } catch (err) {
      console.error('Erro ao carregar cidades do IBGE', err);
      toast.error('Erro ao carregar cidades');
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchGuests = async () => {
    try {
      const response = await fetch('/api/guests');
      const data = await response.json();
      setGuests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar hóspedes:', error);
      toast.error('Erro ao carregar hóspedes');
    } finally {
      setLoading(false);
    }
  };

  const openModal = async (guest?: Guest) => {
    if (guest) {
      setEditingGuest(guest);
      setFormData({
        name: guest.name,
        email: guest.email,
        phone: guest.phone ? formatPhone(guest.phone) : '',
        document: guest.documentType === 'CPF' ? formatCPF(guest.document || '') : onlyDigits(guest.document || ''),
        documentType: guest.documentType,
        nationality: guest.nationality,
        birthDate: guest.birthDate ? guest.birthDate.split('T')[0] : '',
        address: guest.address,
        city: guest.city,
        state: guest.state,
        country: guest.country,
        checkInDate: guest.checkInDate ? guest.checkInDate.split('T')[0] : '',
        checkOutDate: guest.checkOutDate ? guest.checkOutDate.split('T')[0] : '',
        notes: guest.notes,
        avatar: guest.avatar || '',
        agreedToRules: guest.agreedToRules ?? false,
        isActive: guest.isActive,
      });
      // If we have a state value, ensure cities are loaded for it
      if (guest.state) {
        if (states.length === 0) await fetchStates();
        await loadCitiesForState(guest.state);
      }
    } else {
      setEditingGuest(null);
      setFormData(emptyGuest);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGuest(null);
    setFormData(emptyGuest);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Front-end validation
    const newErrors: Record<string, string> = {};
    if (!formData.name || !formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email || !formData.email.trim()) newErrors.email = 'Email é obrigatório';
    if (!formData.phone || !formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    if (!formData.checkInDate) newErrors.checkInDate = 'Data de check-in é obrigatória';
    if (!formData.checkOutDate) newErrors.checkOutDate = 'Data de check-out é obrigatória';
    if (formData.checkInDate && formData.checkOutDate) {
      const inDate = new Date(formData.checkInDate);
      const outDate = new Date(formData.checkOutDate);
      if (outDate < inDate) newErrors.checkOutDate = 'Check-out deve ser igual ou posterior ao check-in';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Preencha os campos obrigatórios corretamente');
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      const url = editingGuest
        ? `/api/guests?id=${editingGuest._id}`
        : '/api/guests';

      // Build payload matching API expectations
      const base = editingGuest ? formData : { ...formData, agreedToRules: true };
      const payload: any = {
        name: base.name,
        email: base.email,
        phone: base.phone,
        document: base.document,
        documentType: base.documentType,
        nationality: base.nationality,
        birthDate: base.birthDate,
        address: base.address,
        city: base.city,
        state: base.state,
        country: base.country,
        notes: base.notes,
        avatar: base.avatar || '',
        agreedToRules: !!base.agreedToRules,
        isActive: base.isActive,
      };

      // Only include dates if provided (avoid sending empty strings)
      if (base.checkInDate) payload.checkInDate = base.checkInDate;
      if (base.checkOutDate) payload.checkOutDate = base.checkOutDate;

      const response = await fetch(url, {
        method: editingGuest ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Erro ao salvar');

      toast.success(editingGuest ? 'Hóspede atualizado!' : 'Hóspede cadastrado!');
      closeModal();
      fetchGuests();
    } catch (error) {
      toast.error('Erro ao salvar hóspede');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este hóspede?')) return;

    try {
      const response = await fetch(`/api/guests?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir');

      toast.success('Hóspede excluído!');
      fetchGuests();
    } catch (error) {
      toast.error('Erro ao excluir hóspede');
    }
  };

  const filteredGuests = guests.filter((guest) =>
    guest.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Hóspedes</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
        >
          <PlusIcon className="h-5 w-5" />
          Novo Hóspede
        </button>
      </div>

      {/* Busca */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome, email ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Lista de Hóspedes */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Nenhum hóspede encontrado
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest) => (
                  <tr key={guest._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {guest.avatar ? (
                          <Image
                            src={guest.avatar}
                            alt={guest.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <UserCircleIcon className="h-6 w-6 text-amber-600" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{guest.name}</div>
                          <div className="text-sm text-gray-500">{guest.document}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{guest.email}</div>
                      <div className="text-sm text-gray-500">{guest.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {guest.checkInDate ? new Date(guest.checkInDate).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {guest.checkOutDate ? new Date(guest.checkOutDate).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setViewingGuest(guest);
                            setIsViewModalOpen(true);
                          }}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                          title="Visualizar"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openModal(guest)}
                          className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded"
                          title="Editar"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(guest._id)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
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
        <div className="md:hidden divide-y divide-gray-200">
          {filteredGuests.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Nenhum hóspede encontrado
            </div>
          ) : (
            filteredGuests.map((guest) => (
              <div key={guest._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {guest.avatar ? (
                      <Image
                        src={guest.avatar}
                        alt={guest.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <UserCircleIcon className="h-7 w-7 text-amber-600" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 truncate">{guest.name}</div>
                      <div className="text-sm text-gray-500 truncate">{guest.email}</div>
                      <div className="text-sm text-gray-500">{guest.phone}</div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {guest.checkInDate && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                            In: {new Date(guest.checkInDate).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                        {guest.checkOutDate && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-100 text-red-800">
                            Out: {new Date(guest.checkOutDate).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => {
                        setViewingGuest(guest);
                        setIsViewModalOpen(true);
                      }}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      title="Visualizar"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => openModal(guest)}
                      className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded"
                      title="Editar"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(guest._id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
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

      {/* Modal de Visualização */}
      {isViewModalOpen && viewingGuest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Detalhes do Hóspede</h2>
              <button onClick={() => { setIsViewModalOpen(false); setViewingGuest(null); }}>
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Avatar e Info Principal */}
              <div className="flex items-center gap-4 pb-4 border-b">
                {viewingGuest.avatar ? (
                  <Image
                    src={viewingGuest.avatar}
                    alt={viewingGuest.name}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center">
                    <UserCircleIcon className="h-12 w-12 text-amber-600" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{viewingGuest.name}</h3>
                  <p className="text-gray-500">{viewingGuest.documentType}: {viewingGuest.document}</p>
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full mt-1 ${
                    viewingGuest.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {viewingGuest.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              {/* Dados de Contato */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase">Email</label>
                  <p className="text-gray-900">{viewingGuest.email || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase">Telefone</label>
                  <p className="text-gray-900">{viewingGuest.phone || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase">Data de Nascimento</label>
                  <p className="text-gray-900">
                    {viewingGuest.birthDate ? new Date(viewingGuest.birthDate).toLocaleDateString('pt-BR') : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase">Nacionalidade</label>
                  <p className="text-gray-900">{viewingGuest.nationality || '-'}</p>
                </div>
              </div>

              {/* Endereço */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                  <label className="text-xs text-gray-500 uppercase">Endereço</label>
                  <p className="text-gray-900">{viewingGuest.address || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase">Cidade</label>
                  <p className="text-gray-900">{viewingGuest.city || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase">Estado</label>
                  <p className="text-gray-900">{viewingGuest.state || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase">País</label>
                  <p className="text-gray-900">{viewingGuest.country || '-'}</p>
                </div>
              </div>

              {/* Reserva */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-xs text-gray-500 uppercase">Check-in</label>
                  <p className="text-gray-900 font-medium">
                    {viewingGuest.checkInDate ? new Date(viewingGuest.checkInDate).toLocaleDateString('pt-BR') : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase">Check-out</label>
                  <p className="text-gray-900 font-medium">
                    {viewingGuest.checkOutDate ? new Date(viewingGuest.checkOutDate).toLocaleDateString('pt-BR') : '-'}
                  </p>
                </div>
              </div>

              {/* Observações */}
              {viewingGuest.notes && (
                <div className="pt-4 border-t">
                  <label className="text-xs text-gray-500 uppercase">Observações</label>
                  <p className="text-gray-900 whitespace-pre-line">{viewingGuest.notes}</p>
                </div>
              )}

              {/* Regras */}
              <div className="pt-4 border-t">
                <label className="text-xs text-gray-500 uppercase">Concordou com as regras</label>
                <p className={`${viewingGuest.agreedToRules ? 'text-green-600' : 'text-red-600'}`}>
                  {viewingGuest.agreedToRules ? 'Sim' : 'Não'}
                </p>
              </div>

              {/* Datas do sistema */}
              <div className="text-xs text-gray-400 pt-4 border-t">
                <p>Cadastrado em: {new Date(viewingGuest.createdAt).toLocaleString('pt-BR')}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-6 mt-4 border-t">
              <button
                onClick={() => { setIsViewModalOpen(false); setViewingGuest(null); }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  openModal(viewingGuest);
                }}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição/Criação */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingGuest ? 'Editar Hóspede' : 'Novo Hóspede'}
              </h2>
              <button onClick={closeModal}>
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Avatar Upload */}
              <div className="flex justify-center pb-4 border-b">
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Foto do Hóspede</label>
                  <CloudinaryUpload
                    folder={CLOUDINARY_FOLDERS.GUESTS}
                    value={formData.avatar || ''}
                    onChange={(url) => setFormData({ ...formData, avatar: url })}
                    previewClassName="h-24 w-24 rounded-full"
                    placeholder="Adicionar foto"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      const formatted = formatPhone(val);
                      setFormData({ ...formData, phone: formatted });
                      setErrors((prev) => ({ ...prev, phone: '' }));
                    }}
                    placeholder="+55(27)98133-0708"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
                  <select
                    value={formData.documentType}
                    onChange={(e) => {
                      const newType = e.target.value;
                      const newDoc = newType === 'CPF' ? formatCPF(formData.document || '') : onlyDigits(formData.document || '');
                      setFormData({ ...formData, documentType: newType, document: newDoc });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="CPF">CPF</option>
                    <option value="RG">RG</option>
                    <option value="Passaporte">Passaporte</option>
                    <option value="CNH">CNH</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Documento</label>
                  <input
                    type="text"
                    value={formData.document}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (formData.documentType === 'CPF') {
                        const formatted = formatCPF(val);
                        setFormData({ ...formData, document: formatted });
                        setErrors((prev) => ({ ...prev, document: '' }));
                      } else {
                        setFormData({ ...formData, document: val });
                        setErrors((prev) => ({ ...prev, document: '' }));
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  {errors.document && <p className="text-sm text-red-600 mt-1">{errors.document}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidade</label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  {loadingStates ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">Carregando estados...</div>
                  ) : (
                    <select
                      value={formData.state}
                      onChange={async (e) => {
                        const sigla = e.target.value;
                        setFormData({ ...formData, state: sigla, city: '' });
                        if (sigla) await loadCitiesForState(sigla);
                        else setCities([]);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Selecione...</option>
                      {states.map((s) => (
                        <option key={s.id} value={s.sigla}>{`${s.sigla} - ${s.nome}`}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                  {loadingCities ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">Carregando cidades...</div>
                  ) : (
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      disabled={cities.length === 0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 disabled:opacity-60"
                    >
                      {cities.length === 0 ? (
                        <option value="">Selecione o estado primeiro</option>
                      ) : (
                        <>
                          <option value="">Selecione...</option>
                          {cities.map((c) => (
                            <option key={c.id} value={c.nome}>{c.nome}</option>
                          ))}
                        </>
                      )}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                  <input
                    type="date"
                    value={formData.checkInDate}
                    onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  {errors.checkInDate && <p className="text-sm text-red-600 mt-1">{errors.checkInDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                  <input
                    type="date"
                    value={formData.checkOutDate}
                    onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  {errors.checkOutDate && <p className="text-sm text-red-600 mt-1">{errors.checkOutDate}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {editingGuest ? (
                <div className="flex items-center gap-3">
                  <input
                    id="agreedToRules"
                    type="checkbox"
                    checked={!!formData.agreedToRules}
                    onChange={(e) => setFormData({ ...formData, agreedToRules: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="agreedToRules" className="text-sm text-gray-700">Concordo com as regras da casa</label>
                </div>
              ) : null}

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50">{saving ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
