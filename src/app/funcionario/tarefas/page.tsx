'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo } from 'react';
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

interface Task {
  _id: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  status: string;
  dueDate?: string;
  notes?: string;
  createdAt: string;
  assignedTo?: {
    name: string;
  };
}

const categories = [
  { value: '', label: 'Todas categorias' },
  { value: 'limpeza', label: '🧹 Limpeza' },
  { value: 'manutencao', label: '🔧 Manutenção' },
  { value: 'piscina', label: '🏊 Piscina' },
  { value: 'jardim', label: '🌿 Jardim' },
  { value: 'compras', label: '🛒 Compras' },
  { value: 'geral', label: '📋 Geral' },
];

const statuses = [
  { value: '', label: 'Todos status' },
  { value: 'pending', label: 'Pendente' },
  { value: 'in-progress', label: 'Em andamento' },
  { value: 'completed', label: 'Concluída' },
];

const priorities = [
  { value: '', label: 'Todas prioridades' },
  { value: 'urgent', label: 'Urgente' },
  { value: 'high', label: 'Alta' },
  { value: 'medium', label: 'Média' },
  { value: 'low', label: 'Baixa' },
];

export default function TarefasPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/staff/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        !searchQuery ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        !filterCategory || task.category === filterCategory;
      const matchesStatus = !filterStatus || task.status === filterStatus;
      const matchesPriority =
        !filterPriority || task.priority === filterPriority;

      return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, filterCategory, filterStatus, filterPriority]);

  const groupedTasks = useMemo(() => {
    const pending = filteredTasks.filter((t) => t.status === 'pending');
    const inProgress = filteredTasks.filter((t) => t.status === 'in-progress');
    const completed = filteredTasks.filter((t) => t.status === 'completed');

    // Sort by priority
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    const sortByPriority = (a: Task, b: Task) =>
      (priorityOrder[a.priority as keyof typeof priorityOrder] || 4) -
      (priorityOrder[b.priority as keyof typeof priorityOrder] || 4);

    return {
      pending: pending.sort(sortByPriority),
      inProgress: inProgress.sort(sortByPriority),
      completed: completed.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    };
  }, [filteredTasks]);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
    };
  }, [tasks]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/staff/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) =>
            t._id === taskId ? { ...t, status: newStatus } : t
          )
        );
        if (selectedTask?._id === taskId) {
          setSelectedTask((prev) =>
            prev ? { ...prev, status: newStatus } : null
          );
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedTask) return;
    try {
      const res = await fetch('/api/staff/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedTask._id, notes }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) =>
            t._id === selectedTask._id ? { ...t, notes } : t
          )
        );
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('Erro ao salvar notas:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'limpeza':
        return '🧹';
      case 'manutencao':
        return '🔧';
      case 'piscina':
        return '🏊';
      case 'jardim':
        return '🌿';
      case 'compras':
        return '🛒';
      default:
        return '📋';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgente';
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      default:
        return 'Baixa';
    }
  };

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate.getTime() === today.getTime()) return 'Hoje';
    if (dueDate.getTime() === tomorrow.getTime()) return 'Amanhã';
    if (dueDate < today) return 'Atrasada';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const isDueOverdue = (dateStr?: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <div
      onClick={() => {
        setSelectedTask(task);
        setNotes(task.notes || '');
      }}
      className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all cursor-pointer ${
        task.status === 'completed'
          ? 'border-slate-100 opacity-60'
          : 'border-slate-200 hover:border-emerald-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleStatusChange(
              task._id,
              task.status === 'completed' ? 'pending' : 'completed'
            );
          }}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            task.status === 'completed'
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-slate-300 hover:border-emerald-500'
          }`}
        >
          {task.status === 'completed' && (
            <CheckCircleSolid className="h-4 w-4 text-white" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-lg">{getCategoryIcon(task.category)}</span>
            <h3
              className={`font-medium ${
                task.status === 'completed'
                  ? 'line-through text-slate-400'
                  : 'text-slate-800'
              }`}
            >
              {task.title}
            </h3>
          </div>

          {task.description && (
            <p className="text-sm text-slate-500 line-clamp-2 mb-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(
                task.priority
              )}`}
            >
              {getPriorityLabel(task.priority)}
            </span>

            {task.dueDate && (
              <span
                className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                  isDueOverdue(task.dueDate) && task.status !== 'completed'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <ClockIcon className="h-3 w-3" />
                {formatDueDate(task.dueDate)}
              </span>
            )}

            {task.status === 'in-progress' && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                Em andamento
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-slate-500">Carregando tarefas...</p>
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
            Minhas Tarefas
          </h1>
          <p className="text-slate-500 mt-1">
            {stats.pending + stats.inProgress} tarefa{stats.pending + stats.inProgress !== 1 ? 's' : ''} pendente{stats.pending + stats.inProgress !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3 border border-slate-100">
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-xs text-slate-500">Total</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
          <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
          <p className="text-xs text-amber-600">Pendentes</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
          <p className="text-2xl font-bold text-blue-700">{stats.inProgress}</p>
          <p className="text-xs text-blue-600">Em andamento</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
          <p className="text-2xl font-bold text-emerald-700">{stats.completed}</p>
          <p className="text-xs text-emerald-600">Concluídas</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar tarefas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${
              showFilters || filterCategory || filterStatus || filterPriority
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FunnelIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Filtros</span>
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform ${
                showFilters ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              {priorities.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Task Sections */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <CheckCircleSolid className="h-16 w-16 mx-auto mb-4 text-emerald-500" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Nenhuma tarefa encontrada
          </h3>
          <p className="text-slate-500">
            {searchQuery || filterCategory || filterStatus || filterPriority
              ? 'Tente ajustar os filtros'
              : 'Você não tem tarefas atribuídas'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Em Andamento */}
          {groupedTasks.inProgress.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-3">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Em Andamento
                <span className="text-sm font-normal text-slate-400">
                  ({groupedTasks.inProgress.length})
                </span>
              </h2>
              <div className="grid gap-3">
                {groupedTasks.inProgress.map((task) => (
                  <TaskCard key={task._id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* Pendentes */}
          {groupedTasks.pending.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-3">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Pendentes
                <span className="text-sm font-normal text-slate-400">
                  ({groupedTasks.pending.length})
                </span>
              </h2>
              <div className="grid gap-3">
                {groupedTasks.pending.map((task) => (
                  <TaskCard key={task._id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* Concluídas */}
          {groupedTasks.completed.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Concluídas
                <span className="text-sm font-normal text-slate-400">
                  ({groupedTasks.completed.length})
                </span>
              </h2>
              <div className="grid gap-3">
                {groupedTasks.completed.slice(0, 5).map((task) => (
                  <TaskCard key={task._id} task={task} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setSelectedTask(null)}
          />
          <div className="fixed inset-x-4 bottom-4 top-auto md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white rounded-2xl shadow-xl z-50 max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                Detalhes da Tarefa
              </h2>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getCategoryIcon(selectedTask.category)}</span>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">
                    {selectedTask.title}
                  </h3>
                  <p className="text-sm text-slate-500 capitalize">
                    {selectedTask.category}
                  </p>
                </div>
              </div>

              {selectedTask.description && (
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Descrição</p>
                  <p className="text-slate-700">{selectedTask.description}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full border ${getPriorityColor(
                    selectedTask.priority
                  )}`}
                >
                  Prioridade: {getPriorityLabel(selectedTask.priority)}
                </span>

                {selectedTask.dueDate && (
                  <span
                    className={`flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${
                      isDueOverdue(selectedTask.dueDate) &&
                      selectedTask.status !== 'completed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <ClockIcon className="h-4 w-4" />
                    Prazo: {formatDueDate(selectedTask.dueDate)}
                  </span>
                )}
              </div>

              {/* Status Buttons */}
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Status</p>
                <div className="flex gap-2 flex-wrap">
                  {['pending', 'in-progress', 'completed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selectedTask._id, status)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        selectedTask.status === status
                          ? status === 'completed'
                            ? 'bg-emerald-500 text-white'
                            : status === 'in-progress'
                            ? 'bg-blue-500 text-white'
                            : 'bg-amber-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {status === 'pending'
                        ? 'Pendente'
                        : status === 'in-progress'
                        ? 'Em andamento'
                        : 'Concluída'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-slate-600 mb-2 block">
                  Notas / Observações
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Adicione notas sobre esta tarefa..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                />
              </div>

              <button
                onClick={handleSaveNotes}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30"
              >
                Salvar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
