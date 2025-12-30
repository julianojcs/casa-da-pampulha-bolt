'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo } from 'react';
import {
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  ShoppingCartIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface Task {
  _id: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  status: string;
  dueDate?: string;
}

interface Supply {
  _id: string;
  name: string;
  category: string;
  status: string;
  urgency: string;
  quantity: string;
}

interface Message {
  _id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  isPinned: boolean;
  readBy: string[];
  createdAt: string;
  createdBy?: {
    name: string;
  };
}

interface Reservation {
  _id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  status: string;
}

export default function FuncionarioDashboard() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [tasksRes, suppliesRes, messagesRes, reservationsRes] =
        await Promise.all([
          fetch('/api/staff/tasks'),
          fetch('/api/staff/supplies'),
          fetch('/api/staff/messages'),
          fetch('/api/reservas?status=confirmada,checkin'),
        ]);

      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (suppliesRes.ok) setSupplies(await suppliesRes.json());
      if (messagesRes.ok) setMessages(await messagesRes.json());
      if (reservationsRes.ok) {
        const data = await reservationsRes.json();
        setReservations(data.reservas || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return { text: 'Bom dia', icon: SunIcon };
    if (hour < 18) return { text: 'Boa tarde', icon: SunIcon };
    return { text: 'Boa noite', icon: MoonIcon };
  }, [currentTime]);

  const stats = useMemo(() => {
    const pendingTasks = tasks.filter(
      (t) => t.status === 'pending' || t.status === 'in-progress'
    ).length;
    const completedToday = tasks.filter((t) => {
      if (t.status !== 'completed') return false;
      return true; // Simplified - in real app, check if completed today
    }).length;
    const criticalSupplies = supplies.filter(
      (s) => s.status === 'critical' || s.status === 'out-of-stock'
    ).length;
    const unreadMessages = messages.filter(
      (m) => !m.readBy?.includes(session?.user?.id || '')
    ).length;

    return { pendingTasks, completedToday, criticalSupplies, unreadMessages };
  }, [tasks, supplies, messages, session?.user?.id]);

  const upcomingCheckIns = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in3Days = new Date(today);
    in3Days.setDate(in3Days.getDate() + 3);

    return reservations
      .filter((r) => {
        const checkIn = new Date(r.checkIn);
        return checkIn >= today && checkIn <= in3Days;
      })
      .sort(
        (a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()
      )
      .slice(0, 5);
  }, [reservations]);

  const upcomingCheckOuts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in3Days = new Date(today);
    in3Days.setDate(in3Days.getDate() + 3);

    return reservations
      .filter((r) => {
        const checkOut = new Date(r.checkOut);
        return checkOut >= today && checkOut <= in3Days;
      })
      .sort(
        (a, b) =>
          new Date(a.checkOut).getTime() - new Date(b.checkOut).getTime()
      )
      .slice(0, 5);
  }, [reservations]);

  const priorityTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status === 'pending' || t.status === 'in-progress')
      .sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return (
          (priorityOrder[a.priority as keyof typeof priorityOrder] || 4) -
          (priorityOrder[b.priority as keyof typeof priorityOrder] || 4)
        );
      })
      .slice(0, 6);
  }, [tasks]);

  const pinnedMessages = useMemo(() => {
    return messages
      .filter((m) => m.isPinned)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 3);
  }, [messages]);

  const criticalSuppliesList = useMemo(() => {
    return supplies
      .filter((s) => s.status === 'critical' || s.status === 'out-of-stock')
      .slice(0, 5);
  }, [supplies]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
  };

  const formatCheckInTime = () => '15:00';
  const formatCheckOutTime = () => '11:00';

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

  const getMessageTypeStyle = (type: string) => {
    switch (type) {
      case 'alert':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'reminder':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'instruction':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  const handleTaskStatusChange = async (
    taskId: string,
    newStatus: string
  ) => {
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
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-slate-500">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const GreetingIcon = greeting.icon;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <GreetingIcon className="h-5 w-5" />
            <span className="text-sm font-medium">{greeting.text}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
            {session?.user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 mt-1">
            {currentTime.toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 self-start sm:self-center"
        >
          <ArrowPathIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Atualizar</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 lg:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <ClipboardDocumentListIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl lg:text-3xl font-bold text-slate-800">
              {stats.pendingTasks}
            </span>
          </div>
          <p className="text-sm text-slate-500">Tarefas pendentes</p>
        </div>

        <div className="bg-white rounded-2xl p-4 lg:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <CheckCircleIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl lg:text-3xl font-bold text-slate-800">
              {stats.completedToday}
            </span>
          </div>
          <p className="text-sm text-slate-500">Concluídas</p>
        </div>

        <div className="bg-white rounded-2xl p-4 lg:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <ShoppingCartIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl lg:text-3xl font-bold text-slate-800">
              {stats.criticalSupplies}
            </span>
          </div>
          <p className="text-sm text-slate-500">Materiais em falta</p>
        </div>

        <div className="bg-white rounded-2xl p-4 lg:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl lg:text-3xl font-bold text-slate-800">
              {stats.unreadMessages}
            </span>
          </div>
          <p className="text-sm text-slate-500">Recados não lidos</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Check-ins e Check-outs */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Próximos Check-ins */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-600" />
                </div>
                <h2 className="font-semibold text-slate-800">Próximos Check-ins</h2>
              </div>
              <span className="text-xs font-medium text-slate-400">
                {formatCheckInTime()}
              </span>
            </div>
            <div className="divide-y divide-slate-50">
              {upcomingCheckIns.length === 0 ? (
                <div className="px-5 py-8 text-center text-slate-400">
                  <UserGroupIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum check-in próximo</p>
                </div>
              ) : (
                upcomingCheckIns.map((res) => (
                  <div
                    key={res._id}
                    className="px-5 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-xs">
                          {res.guestName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">
                            {res.guestName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {res.guestCount} hóspede{res.guestCount > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-emerald-600">
                          {formatDate(res.checkIn)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link
              href="/funcionario/calendario"
              className="block px-5 py-3 text-center text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors border-t border-slate-100"
            >
              Ver calendário completo
              <ArrowRightIcon className="h-4 w-4 inline-block ml-1" />
            </Link>
          </div>

          {/* Próximos Check-outs */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                  <ArrowRightIcon className="h-4 w-4 text-rose-600 rotate-45" />
                </div>
                <h2 className="font-semibold text-slate-800">Próximos Check-outs</h2>
              </div>
              <span className="text-xs font-medium text-slate-400">
                {formatCheckOutTime()}
              </span>
            </div>
            <div className="divide-y divide-slate-50">
              {upcomingCheckOuts.length === 0 ? (
                <div className="px-5 py-8 text-center text-slate-400">
                  <UserGroupIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum check-out próximo</p>
                </div>
              ) : (
                upcomingCheckOuts.map((res) => (
                  <div
                    key={res._id}
                    className="px-5 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-semibold text-xs">
                          {res.guestName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">
                            {res.guestName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {res.guestCount} hóspede{res.guestCount > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-rose-600">
                          {formatDate(res.checkOut)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link
              href="/funcionario/calendario"
              className="block px-5 py-3 text-center text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100"
            >
              Ver calendário completo
              <ArrowRightIcon className="h-4 w-4 inline-block ml-1" />
            </Link>
          </div>
        </div>

        {/* Recados Importantes */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="h-4 w-4 text-purple-600" />
              </div>
              <h2 className="font-semibold text-slate-800">Recados Fixados</h2>
            </div>
            {stats.unreadMessages > 0 && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                {stats.unreadMessages} novos
              </span>
            )}
          </div>
          <div className="divide-y divide-slate-50 max-h-[280px] overflow-y-auto">
            {pinnedMessages.length === 0 ? (
              <div className="px-5 py-8 text-center text-slate-400">
                <ChatBubbleLeftRightIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum recado fixado</p>
              </div>
            ) : (
              pinnedMessages.map((msg) => (
                <div
                  key={msg._id}
                  className={`px-5 py-4 ${getMessageTypeStyle(msg.type)} border-l-4`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm mb-1">{msg.title}</p>
                      <p className="text-xs opacity-80 line-clamp-2">
                        {msg.content}
                      </p>
                      <p className="text-xs opacity-60 mt-2">
                        {msg.createdBy?.name} •{' '}
                        {new Date(msg.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link
            href="/funcionario/recados"
            className="block px-5 py-3 text-center text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors border-t border-slate-100"
          >
            Ver todos os recados
            <ArrowRightIcon className="h-4 w-4 inline-block ml-1" />
          </Link>
        </div>
      </div>

      {/* Tasks and Supplies */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Tarefas Prioritárias */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <ClipboardDocumentListIcon className="h-4 w-4 text-blue-600" />
              </div>
              <h2 className="font-semibold text-slate-800">Suas Tarefas</h2>
            </div>
            <Link
              href="/funcionario/tarefas"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Ver todas
              <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {priorityTasks.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <CheckCircleSolid className="h-12 w-12 mx-auto mb-3 text-emerald-500" />
                <p className="text-slate-600 font-medium">Nenhuma tarefa pendente!</p>
                <p className="text-sm text-slate-400 mt-1">
                  Você está em dia com suas atividades
                </p>
              </div>
            ) : (
              priorityTasks.map((task) => (
                <div
                  key={task._id}
                  className="px-5 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() =>
                        handleTaskStatusChange(
                          task._id,
                          task.status === 'completed' ? 'pending' : 'completed'
                        )
                      }
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg">{getCategoryIcon(task.category)}</span>
                        <p
                          className={`font-medium ${
                            task.status === 'completed'
                              ? 'line-through text-slate-400'
                              : 'text-slate-800'
                          }`}
                        >
                          {task.title}
                        </p>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority === 'urgent'
                            ? 'Urgente'
                            : task.priority === 'high'
                            ? 'Alta'
                            : task.priority === 'medium'
                            ? 'Média'
                            : 'Baixa'}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                          <ClockIcon className="h-3 w-3" />
                          <span>
                            Prazo: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        handleTaskStatusChange(
                          task._id,
                          task.status === 'in-progress' ? 'pending' : 'in-progress'
                        )
                      }
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        task.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      {task.status === 'in-progress' ? 'Em andamento' : 'Iniciar'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Materiais em Falta */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <ShoppingCartIcon className="h-4 w-4 text-amber-600" />
              </div>
              <h2 className="font-semibold text-slate-800">Materiais</h2>
            </div>
            {criticalSuppliesList.length > 0 && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                {criticalSuppliesList.length} críticos
              </span>
            )}
          </div>
          <div className="divide-y divide-slate-50 max-h-[280px] overflow-y-auto">
            {criticalSuppliesList.length === 0 ? (
              <div className="px-5 py-8 text-center text-slate-400">
                <CheckCircleSolid className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                <p className="text-sm font-medium text-slate-600">
                  Estoque em dia!
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Nenhum material crítico
                </p>
              </div>
            ) : (
              criticalSuppliesList.map((supply) => (
                <div
                  key={supply._id}
                  className="px-5 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">
                        {supply.name}
                      </p>
                      <p className="text-xs text-slate-400 capitalize">
                        {supply.category}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-lg ${
                        supply.status === 'out-of-stock'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {supply.status === 'out-of-stock' ? 'Esgotado' : 'Crítico'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link
            href="/funcionario/materiais"
            className="block px-5 py-3 text-center text-sm font-medium text-amber-600 hover:bg-amber-50 transition-colors border-t border-slate-100"
          >
            Gerenciar materiais
            <ArrowRightIcon className="h-4 w-4 inline-block ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
