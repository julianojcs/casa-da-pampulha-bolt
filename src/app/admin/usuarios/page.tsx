'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  UserCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { CloudinaryUpload } from '@/components/CloudinaryUpload';

interface Host {
  bio?: string;
  role?: string;
  languages?: string[];
  responseTime?: string;
  responseRate?: string;
  isSuperhost?: boolean;
  joinedDate?: string;
}

interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'guest' | 'host';
  phone?: string;
  avatar?: string;
  isActive: boolean;
  emailVerified?: boolean;
  host?: Host;
  createdAt: string;
}

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  guest: 'Hóspede',
  host: 'Anfitrião',
};

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800',
  guest: 'bg-blue-100 text-blue-800',
  host: 'bg-amber-100 text-amber-800',
};

const emptyUser: Omit<User, '_id' | 'createdAt'> = {
  email: '',
  name: '',
  role: 'guest',
  phone: '',
  avatar: '',
  isActive: true,
  emailVerified: false,
  host: undefined,
};

const emptyHost: Host = {
  bio: '',
  role: 'Coanfitrião',
  languages: ['Português'],
  responseTime: 'Dentro de uma hora',
  responseRate: '100%',
  isSuperhost: false,
  joinedDate: new Date().toISOString().split('T')[0],
};

// Lista de idiomas disponíveis
const AVAILABLE_LANGUAGES = [
  'Português',
  'Inglês',
  'Espanhol',
  'Francês',
  'Alemão',
  'Italiano',
  'Japonês',
  'Mandarim',
  'Coreano',
  'Russo',
  'Árabe',
];

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Omit<User, '_id' | 'createdAt'> & { password?: string }>(emptyUser);
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (searchTerm) params.set('search', searchTerm);
      params.set('page', pagination.page.toString());

      const response = await fetch(`/api/users?${params}`);
      const data = await response.json();

      if (data.users) {
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone || '',
        avatar: user.avatar || '',
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        host: user.host,
      });
    } else {
      setEditingUser(null);
      setFormData({ ...emptyUser, password: '' });
    }
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsViewMode(false);
    setEditingUser(null);
    setFormData(emptyUser);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = editingUser
        ? { ...formData, _id: editingUser._id }
        : formData;

      const response = await fetch('/api/users', {
        method: editingUser ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar');
      }

      toast.success(editingUser ? 'Usuário atualizado!' : 'Usuário criado!');
      closeModal();
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar usuário');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      const response = await fetch(`/api/users?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast.success('Usuário excluído!');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir usuário');
    }
  };

  const addLanguage = (lang: string) => {
    if (lang && formData.host && !formData.host.languages?.includes(lang)) {
      setFormData({
        ...formData,
        host: {
          ...formData.host,
          languages: [...(formData.host.languages || []), lang],
        },
      });
    }
  };

  const removeLanguage = (index: number) => {
    if (formData.host) {
      setFormData({
        ...formData,
        host: {
          ...formData.host,
          languages: formData.host.languages?.filter((_, i) => i !== index),
        },
      });
    }
  };

  const openViewModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone || '',
      avatar: user.avatar || '',
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      host: user.host,
    });
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  const toggleHostData = (enable: boolean) => {
    if (enable) {
      setFormData({ ...formData, host: emptyHost });
    } else {
      setFormData({ ...formData, host: undefined });
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Usuários</h1>
          <p className="text-gray-500 mt-1">Gerencie todos os usuários do sistema</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center space-x-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="all">Todos os tipos</option>
            <option value="admin">Administradores</option>
            <option value="guest">Hóspedes</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        ) : users.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Anfitrião
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => openViewModal(user)}
                            className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                            title="Visualizar"
                          >
                            {user.avatar ? (
                              <Image
                                src={user.avatar}
                                alt={user.name}
                                width={40}
                                height={40}
                                className="rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <UserCircleIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </button>
                          <div>
                            <p className="font-medium text-gray-800">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                          {roleLabels[user.role]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {user.isActive ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircleIcon className="h-5 w-5 text-red-500" />
                          )}
                          <span className={user.isActive ? 'text-green-700' : 'text-red-700'}>
                            {user.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.host ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            {user.host.role}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openModal(user)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Editar"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {users.map((user) => (
                <div key={user._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => openViewModal(user)}
                        className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        title="Visualizar"
                      >
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <UserCircleIcon className="h-7 w-7 text-gray-400" />
                          </div>
                        )}
                      </button>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate">{user.name}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                            {roleLabels[user.role]}
                          </span>
                          {user.isActive ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              <XCircleIcon className="h-3 w-3 mr-1" />
                              Inativo
                            </span>
                          )}
                          {user.host && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              {user.host.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => openModal(user)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Editar"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Mostrando {users.length} de {pagination.total} usuários
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="px-3 py-1">
                    {pagination.page} / {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum usuário encontrado.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-800">
                {isViewMode ? 'Visualizar Usuário' : editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Dados básicos */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome {!isViewMode && '*'}
                  </label>
                  <input
                    type="text"
                    required={!isViewMode}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-50"
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email {!isViewMode && '*'}
                  </label>
                  <input
                    type="email"
                    required={!isViewMode}
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-50"
                    disabled={isViewMode}
                  />
                </div>

                {!editingUser && !isViewMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Senha *
                    </label>
                    <input
                      type="password"
                      required={!editingUser}
                      value={formData.password || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-50"
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo {!isViewMode && '*'}
                  </label>
                  <select
                    required={!isViewMode}
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'guest' | 'host' }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-50"
                    disabled={isViewMode}
                  >
                    <option value="guest">Hóspede</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                {!isViewMode && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Avatar
                    </label>
                    <CloudinaryUpload
                      folder="guests"
                      value={formData.avatar || ''}
                      onChange={(url) => setFormData(prev => ({ ...prev, avatar: url }))}
                      placeholder="Upload do avatar"
                      previewClassName="h-24 w-24 rounded-full"
                      maxSizeKB={2048}
                      isAvatar
                    />
                  </div>
                )}

                {isViewMode && formData.avatar && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Avatar
                    </label>
                    <Image
                      src={formData.avatar}
                      alt={formData.name}
                      width={96}
                      height={96}
                      className="rounded-full object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      disabled={isViewMode}
                    />
                    <span className="text-sm font-medium text-gray-700">Ativo</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.emailVerified}
                      onChange={(e) => setFormData(prev => ({ ...prev, emailVerified: e.target.checked }))}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      disabled={isViewMode}
                    />
                    <span className="text-sm font-medium text-gray-700">Email verificado</span>
                  </label>
                </div>
              </div>

              {/* Dados de Anfitrião */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Dados de Anfitrião</h3>
                  {!isViewMode && (
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={!!formData.host}
                        onChange={(e) => toggleHostData(e.target.checked)}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm font-medium text-gray-700">É anfitrião</span>
                    </label>
                  )}
                  {isViewMode && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${formData.host ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {formData.host ? 'Sim' : 'Não'}
                    </span>
                  )}
                </div>

                {formData.host && (
                  <div className="grid md:grid-cols-2 gap-4 bg-amber-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Função
                      </label>
                      <select
                        value={formData.host.role || 'Coanfitrião'}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          host: { ...prev.host!, role: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-50"
                        disabled={isViewMode}
                      >
                        <option value="Anfitrião">Anfitrião</option>
                        <option value="Anfitriã">Anfitriã</option>
                        <option value="Coanfitrião">Coanfitrião</option>
                        <option value="Coanfitriã">Coanfitriã</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Membro desde
                      </label>
                      <input
                        type="date"
                        value={formData.host.joinedDate?.split('T')[0] || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          host: { ...prev.host!, joinedDate: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-50"
                        disabled={isViewMode}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        rows={3}
                        value={formData.host.bio || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          host: { ...prev.host!, bio: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        disabled={isViewMode}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Idiomas
                      </label>
                      <div className="flex gap-2 mb-2">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              addLanguage(e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                          disabled={isViewMode}
                        >
                          <option value="">Selecione um idioma...</option>
                          {AVAILABLE_LANGUAGES.filter(lang => !formData.host?.languages?.includes(lang)).map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </select>
                      </div>
                      {formData.host.languages && formData.host.languages.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.host.languages.map((lang, index) => (
                            <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                              {lang}
                              {!isViewMode && (
                                <button type="button" onClick={() => removeLanguage(index)}>
                                  <XMarkIcon className="h-4 w-4 hover:text-red-600" />
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tempo de resposta
                      </label>
                      <input
                        type="text"
                        value={formData.host.responseTime || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          host: { ...prev.host!, responseTime: e.target.value }
                        }))}
                        placeholder="Ex: Dentro de uma hora"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-50"
                        disabled={isViewMode}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Taxa de resposta
                      </label>
                      <input
                        type="text"
                        value={formData.host.responseRate || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          host: { ...prev.host!, responseRate: e.target.value }
                        }))}
                        placeholder="Ex: 100%"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-50"
                        disabled={isViewMode}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.host.isSuperhost || false}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            host: { ...prev.host!, isSuperhost: e.target.checked }
                          }))}
                          className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          disabled={isViewMode}
                        />
                        <span className="text-sm font-medium text-gray-700">Superhost</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  {isViewMode ? 'Fechar' : 'Cancelar'}
                </button>
                {!isViewMode && (
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
