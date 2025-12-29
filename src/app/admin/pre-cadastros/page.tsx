'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
  UserPlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { formatPhone } from '@/lib/helpers';
import { IPreRegistration } from '@/models/PreRegistration';

export default function PreCadastrosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [preRegistrations, setPreRegistrations] = useState<IPreRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IPreRegistration | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    expirationDays: 30,
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

    try {
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem
        ? { id: editingItem._id, ...formData }
        : formData;

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
      setFormData({
        name: item.name,
        email: item.email || '',
        phone: item.phone,
        notes: item.notes || '',
        expirationDays: 30,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        notes: '',
        expirationDays: 30,
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
    });
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
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.includes(searchTerm) ||
      (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase()))
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
              <option value="registered">Cadastrados</option>
              <option value="expired">Expirados</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <CheckIcon className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-green-700">Cadastrados</p>
                <p className="text-2xl font-bold text-green-800">
                  {preRegistrations.filter((p) => p.status === 'registered').length}
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
                    <td colSpan={5} className="py-12 text-center text-gray-500">
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
                      <td className="py-4 px-6">{getStatusBadge(item.status)}</td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600">
                          {new Date(item.expiresAt).toLocaleDateString('pt-BR')}
                        </span>
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
                        <div className="flex items-center gap-2 text-gray-500">
                          <ClockIcon className="h-4 w-4 flex-shrink-0" />
                          <span>Expira: {new Date(item.expiresAt).toLocaleDateString('pt-BR')}</span>
                        </div>
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
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

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="+55 (27) 98888-8888"
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
                  placeholder="Ex: Reserva de 10-15/Jan, 3 pessoas..."
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
