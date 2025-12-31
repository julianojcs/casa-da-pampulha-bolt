'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  BellAlertIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

interface StaffMessage {
  _id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  createdBy: string;
  createdByName?: string;
  targetRoles?: string[];
  targetUsers?: string[];
  expiresAt?: string;
  isPinned?: boolean;
  readBy?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StaffUser {
  _id: string;
  name: string;
  staff?: {
    nickname?: string;
    jobType?: string;
  };
}

const typeLabels: Record<string, string> = {
  announcement: 'Comunicado',
  reminder: 'Lembrete',
  instruction: 'Instrução',
  alert: 'Alerta',
};

const priorityLabels: Record<string, string> = {
  normal: 'Normal',
  important: 'Importante',
  urgent: 'Urgente',
};

const priorityColors: Record<string, string> = {
  normal: 'bg-gray-100 text-gray-700',
  important: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
};

const typeColors: Record<string, string> = {
  announcement: 'bg-blue-100 text-blue-700',
  reminder: 'bg-purple-100 text-purple-700',
  instruction: 'bg-green-100 text-green-700',
  alert: 'bg-red-100 text-red-700',
};

const jobTypeLabels: Record<string, string> = {
  piscineiro: 'Piscineiro',
  jardineiro: 'Jardineiro',
  faxineira: 'Faxineira',
  manutencao: 'Manutenção',
  outro: 'Outro',
};

export default function AdminRecadosPage() {
  const [messages, setMessages] = useState<StaffMessage[]>([]);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<StaffMessage | null>(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'announcement',
    priority: 'normal',
    targetRoles: [] as string[],
    targetUsers: [] as string[],
    expiresAt: '',
    isPinned: false,
    isActive: true,
  });

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/staff/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Erro ao buscar recados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStaffUsers = async () => {
    try {
      const res = await fetch('/api/users?role=staff');
      if (res.ok) {
        const data = await res.json();
        // API returns {users: [...], pagination: {...}}
        setStaffUsers(Array.isArray(data.users) ? data.users : Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      setStaffUsers([]);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchStaffUsers();
  }, [fetchMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      expiresAt: formData.expiresAt || undefined,
      _id: editingMessage?._id,
    };

    const method = editingMessage ? 'PUT' : 'POST';
    const res = await fetch('/api/staff/messages', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      fetchMessages();
      closeModal();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este recado?')) return;

    const res = await fetch(`/api/staff/messages?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchMessages();
    }
  };

  const handleTogglePin = async (message: StaffMessage) => {
    const res = await fetch('/api/staff/messages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _id: message._id,
        isPinned: !message.isPinned,
      }),
    });

    if (res.ok) {
      fetchMessages();
    }
  };

  const handleToggleActive = async (message: StaffMessage) => {
    const res = await fetch('/api/staff/messages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _id: message._id,
        isActive: !message.isActive,
      }),
    });

    if (res.ok) {
      fetchMessages();
    }
  };

  const openModal = (message?: StaffMessage) => {
    if (message) {
      setEditingMessage(message);
      setFormData({
        title: message.title,
        content: message.content,
        type: message.type,
        priority: message.priority,
        targetRoles: message.targetRoles || [],
        targetUsers: message.targetUsers || [],
        expiresAt: message.expiresAt ? new Date(message.expiresAt).toISOString().split('T')[0] : '',
        isPinned: message.isPinned || false,
        isActive: message.isActive,
      });
    } else {
      setEditingMessage(null);
      setFormData({
        title: '',
        content: '',
        type: 'announcement',
        priority: 'normal',
        targetRoles: [],
        targetUsers: [],
        expiresAt: '',
        isPinned: false,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMessage(null);
  };

  const toggleTargetRole = (role: string) => {
    const newRoles = formData.targetRoles.includes(role)
      ? formData.targetRoles.filter(r => r !== role)
      : [...formData.targetRoles, role];
    setFormData({ ...formData, targetRoles: newRoles });
  };

  const toggleTargetUser = (userId: string) => {
    const newUsers = formData.targetUsers.includes(userId)
      ? formData.targetUsers.filter(u => u !== userId)
      : [...formData.targetUsers, userId];
    setFormData({ ...formData, targetUsers: newUsers });
  };

  const filteredMessages = messages.filter((msg) =>
    msg.title.toLowerCase().includes(search.toLowerCase()) ||
    msg.content.toLowerCase().includes(search.toLowerCase())
  );

  // Separate pinned and regular messages
  const pinnedMessages = filteredMessages.filter(m => m.isPinned);
  const regularMessages = filteredMessages.filter(m => !m.isPinned);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recados</h1>
          <p className="text-gray-500 mt-1">Envie comunicados e lembretes para os funcionários</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Novo Recado
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar recados..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Pinned Messages */}
      {pinnedMessages.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <BellAlertIcon className="h-4 w-4" />
            Fixados
          </h2>
          {pinnedMessages.map((message) => (
            <MessageCard
              key={message._id}
              message={message}
              onEdit={() => openModal(message)}
              onDelete={() => handleDelete(message._id)}
              onTogglePin={() => handleTogglePin(message)}
              onToggleActive={() => handleToggleActive(message)}
            />
          ))}
        </div>
      )}

      {/* Regular Messages */}
      <div className="space-y-3">
        {regularMessages.length === 0 && pinnedMessages.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum recado encontrado</p>
          </div>
        ) : (
          regularMessages.map((message) => (
            <MessageCard
              key={message._id}
              message={message}
              onEdit={() => openModal(message)}
              onDelete={() => handleDelete(message._id)}
              onTogglePin={() => handleTogglePin(message)}
              onToggleActive={() => handleToggleActive(message)}
            />
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingMessage ? 'Editar Recado' : 'Novo Recado'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo *</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    {Object.entries(typeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    {Object.entries(priorityLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destinatários por Função</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.targetRoles.length === Object.keys(jobTypeLabels).length) {
                        setFormData({ ...formData, targetRoles: [] });
                      } else {
                        setFormData({ ...formData, targetRoles: Object.keys(jobTypeLabels) });
                      }
                    }}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                      formData.targetRoles.length === 0 || formData.targetRoles.length === Object.keys(jobTypeLabels).length
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Todos
                  </button>
                  {Object.entries(jobTypeLabels).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleTargetRole(value)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                        formData.targetRoles.includes(value)
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destinatários Específicos</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                  {staffUsers.map((user) => (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => toggleTargetUser(user._id)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                        formData.targetUsers.includes(user._id)
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {user.staff?.nickname || user.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expira em</label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-700">Fixar no topo</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-700">Ativo</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  {editingMessage ? 'Salvar' : 'Enviar Recado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Message Card Component
function MessageCard({
  message,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleActive,
}: {
  message: StaffMessage;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onToggleActive: () => void;
}) {
  return (
    <div
      className={`bg-white rounded-xl border overflow-hidden ${
        message.isPinned ? 'border-amber-300 shadow-amber-100 shadow-sm' : 'border-gray-200'
      } ${!message.isActive ? 'opacity-50' : ''}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors[message.type]}`}>
                {typeLabels[message.type] || message.type}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[message.priority]}`}>
                {priorityLabels[message.priority] || message.priority}
              </span>
              {message.isPinned && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                  Fixado
                </span>
              )}
              {!message.isActive && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
                  Inativo
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900">{message.title}</h3>
            <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{message.content}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onTogglePin}
              className={`p-1.5 rounded-lg transition-colors ${
                message.isPinned
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
              }`}
              title={message.isPinned ? 'Desafixar' : 'Fixar'}
            >
              <BellAlertIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onToggleActive}
              className={`p-1.5 rounded-lg transition-colors ${
                message.isActive
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
              }`}
              title={message.isActive ? 'Desativar' : 'Ativar'}
            >
              <EyeIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onEdit}
              className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            >
              <PencilSquareIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
          <span>Criado por: {message.createdByName || 'Admin'}</span>
          <span>{new Date(message.createdAt).toLocaleDateString('pt-BR')}</span>
          {message.readBy && message.readBy.length > 0 && (
            <span className="flex items-center gap-1">
              <EyeIcon className="h-3.5 w-3.5" />
              {message.readBy.length} leitura(s)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
