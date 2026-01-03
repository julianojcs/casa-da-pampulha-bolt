'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo } from 'react';
import {
  ChatBubbleLeftRightIcon,
  MegaphoneIcon,
  BellAlertIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  FunnelIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

interface Message {
  _id: string;
  title: string;
  content: string;
  type: 'announcement' | 'reminder' | 'instruction' | 'alert';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isPinned: boolean;
  readBy: string[];
  createdAt: string;
  expiresAt?: string;
  createdBy?: {
    name: string;
    image?: string;
  };
}

const typeLabels = {
  announcement: { label: 'Anúncio', icon: MegaphoneIcon, color: 'blue' },
  reminder: { label: 'Lembrete', icon: BellAlertIcon, color: 'amber' },
  instruction: { label: 'Instrução', icon: DocumentTextIcon, color: 'purple' },
  alert: { label: 'Alerta', icon: ExclamationTriangleIcon, color: 'red' },
};

export default function RecadosPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterRead, setFilterRead] = useState('unread'); // Default to unread
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const userId = session?.user?.id || '';

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
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
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const res = await fetch('/api/staff/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: messageId, markAsRead: true }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId
              ? { ...m, readBy: [...(m.readBy || []), userId] }
              : m
          )
        );
        // If viewing this message, update selectedMessage too
        if (selectedMessage?._id === messageId) {
          setSelectedMessage((prev) =>
            prev ? { ...prev, readBy: [...(prev.readBy || []), userId] } : null
          );
        }
      }
    } catch (error) {
      console.error('Erro ao marcar como lido:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadMessages = messages.filter(
      (m) => !m.readBy?.includes(userId)
    );
    for (const msg of unreadMessages) {
      await handleMarkAsRead(msg._id);
    }
  };

  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const matchesType = !filterType || msg.type === filterType;
      const isRead = msg.readBy?.includes(userId);
      const matchesRead =
        !filterRead ||
        (filterRead === 'read' && isRead) ||
        (filterRead === 'unread' && !isRead);

      return matchesType && matchesRead;
    });
  }, [messages, filterType, filterRead, userId]);

  const sortedMessages = useMemo(() => {
    const pinned = filteredMessages.filter((m) => m.isPinned);
    const notPinned = filteredMessages.filter((m) => !m.isPinned);

    const sortByDate = (a: Message, b: Message) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    return [...pinned.sort(sortByDate), ...notPinned.sort(sortByDate)];
  }, [filteredMessages]);

  const stats = useMemo(() => {
    const unread = messages.filter((m) => !m.readBy?.includes(userId)).length;
    const pinned = messages.filter((m) => m.isPinned).length;
    const urgent = messages.filter((m) => m.priority === 'urgent').length;
    return { total: messages.length, unread, pinned, urgent };
  }, [messages, userId]);

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'alert':
        return 'bg-red-50 border-red-200';
      case 'reminder':
        return 'bg-amber-50 border-amber-200';
      case 'instruction':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'alert':
        return 'text-red-600';
      case 'reminder':
        return 'text-amber-600';
      case 'instruction':
        return 'text-purple-600';
      default:
        return 'text-blue-600';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'normal':
        return 'bg-slate-100 text-slate-600';
      default:
        return 'bg-slate-50 text-slate-500';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours}h`;
    if (diffDays < 7) return `Há ${diffDays}d`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-slate-500">Carregando recados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
            Recados
          </h1>
          <p className="text-slate-500 mt-1">
            Mensagens e avisos dos administradores
          </p>
        </div>
        {stats.unread > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 font-medium rounded-xl hover:bg-emerald-100 transition-colors self-start sm:self-center"
          >
            <CheckCircleIcon className="h-5 w-5" />
            Marcar todos como lidos
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3 border border-slate-100">
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-xs text-slate-500">Total</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
          <p className="text-2xl font-bold text-blue-700">{stats.unread}</p>
          <p className="text-xs text-blue-600">Não lidos</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
          <p className="text-2xl font-bold text-amber-700">{stats.pinned}</p>
          <p className="text-xs text-amber-600">Fixados</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 border border-red-100">
          <p className="text-2xl font-bold text-red-700">{stats.urgent}</p>
          <p className="text-xs text-red-600">Urgentes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${
            showFilters || filterType || filterRead
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FunnelIcon className="h-5 w-5" />
          <span>Filtros</span>
          <ChevronDownIcon
            className={`h-4 w-4 transition-transform ${
              showFilters ? 'rotate-180' : ''
            }`}
          />
        </button>

        {(filterType || filterRead) && (
          <button
            onClick={() => {
              setFilterType('');
              setFilterRead('');
            }}
            className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          >
            <option value="">Todos os tipos</option>
            <option value="announcement">📢 Anúncios</option>
            <option value="reminder">🔔 Lembretes</option>
            <option value="instruction">📄 Instruções</option>
            <option value="alert">⚠️ Alertas</option>
          </select>
          <select
            value={filterRead}
            onChange={(e) => setFilterRead(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          >
            <option value="">Todos</option>
            <option value="unread">Não lidos</option>
            <option value="read">Lidos</option>
          </select>
        </div>
      )}

      {/* Messages List */}
      {sortedMessages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <ChatBubbleLeftRightIcon className="h-16 w-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Nenhum recado encontrado
          </h3>
          <p className="text-slate-500">
            {filterType || filterRead
              ? 'Tente ajustar os filtros'
              : 'Você não tem recados no momento'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedMessages.map((msg) => {
            const isRead = msg.readBy?.includes(userId);
            const TypeIcon = typeLabels[msg.type]?.icon || MegaphoneIcon;

            return (
              <button
                key={msg._id}
                onClick={() => {
                  setSelectedMessage(msg);
                  if (!isRead) handleMarkAsRead(msg._id);
                }}
                className={`w-full text-left rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                  getTypeStyle(msg.type)
                } ${!isRead ? 'border-l-4' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      msg.type === 'alert'
                        ? 'bg-red-100'
                        : msg.type === 'reminder'
                        ? 'bg-amber-100'
                        : msg.type === 'instruction'
                        ? 'bg-purple-100'
                        : 'bg-blue-100'
                    }`}
                  >
                    <TypeIcon className={`h-5 w-5 ${getTypeColor(msg.type)}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {msg.isPinned && (
                        <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                          📌 Fixado
                        </span>
                      )}
                      {!isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                      <h3 className="font-semibold text-slate-800">
                        {msg.title}
                      </h3>
                      {msg.priority !== 'normal' && msg.priority !== 'low' && (
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityBadge(
                            msg.priority
                          )}`}
                        >
                          {msg.priority === 'urgent' ? 'Urgente' : 'Alta'}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                      {msg.content}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{msg.createdBy?.name || 'Admin'}</span>
                      <span>•</span>
                      <span>{formatDate(msg.createdAt)}</span>
                      <span>•</span>
                      <span>{typeLabels[msg.type]?.label}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setSelectedMessage(null)}
          />
          <div className="fixed inset-x-4 bottom-4 top-auto md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white rounded-2xl shadow-xl z-50 max-h-[80vh] overflow-y-auto">
            <div
              className={`sticky top-0 px-6 py-4 border-b flex items-center justify-between ${getTypeStyle(
                selectedMessage.type
              )}`}
            >
              <div className="flex items-center gap-3">
                {(() => {
                  const TypeIcon =
                    typeLabels[selectedMessage.type]?.icon || MegaphoneIcon;
                  return (
                    <TypeIcon
                      className={`h-6 w-6 ${getTypeColor(selectedMessage.type)}`}
                    />
                  );
                })()}
                <div>
                  <span className="text-sm font-medium text-slate-500">
                    {typeLabels[selectedMessage.type]?.label}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <svg
                  className="h-5 w-5 text-slate-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {selectedMessage.isPinned && (
                  <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                    📌 Fixado
                  </span>
                )}
                {selectedMessage.priority !== 'normal' &&
                  selectedMessage.priority !== 'low' && (
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityBadge(
                        selectedMessage.priority
                      )}`}
                    >
                      {selectedMessage.priority === 'urgent' ? 'Urgente' : 'Alta Prioridade'}
                    </span>
                  )}
              </div>

              <h2 className="text-xl font-bold text-slate-800 mb-4">
                {selectedMessage.title}
              </h2>

              <div className="prose prose-slate prose-sm max-w-none mb-6">
                <p className="text-slate-700 whitespace-pre-wrap">
                  {selectedMessage.content}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                {selectedMessage.createdBy?.image ? (
                  <img
                    src={selectedMessage.createdBy.image}
                    alt={selectedMessage.createdBy.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold">
                    {selectedMessage.createdBy?.name?.charAt(0).toUpperCase() ||
                      'A'}
                  </div>
                )}
                <div>
                  <p className="font-medium text-slate-800">
                    {selectedMessage.createdBy?.name || 'Administrador'}
                  </p>
                  <p className="text-sm text-slate-500">
                    {new Date(selectedMessage.createdAt).toLocaleDateString(
                      'pt-BR',
                      {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
