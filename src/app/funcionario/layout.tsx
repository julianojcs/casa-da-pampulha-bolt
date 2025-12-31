'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ShoppingCartIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  BellIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { signOut } from 'next-auth/react';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: 'tasks' | 'materials' | 'messages';
}

interface PropertyInfo {
  name: string;
  logo?: string;
  heroImage?: string;
}

interface StaffStats {
  pendingTasks: number;
  inProgressTasks: number;
  unreadMessages: number;
  materialsWithIssues: number;
  hasUrgentMaterials: boolean;
  hasUrgentMessages: boolean;
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', href: '/funcionario', icon: HomeIcon },
  { name: 'Minhas Tarefas', href: '/funcionario/tarefas', icon: ClipboardDocumentListIcon, badgeKey: 'tasks' },
  { name: 'Calendário', href: '/funcionario/calendario', icon: CalendarDaysIcon },
  { name: 'Materiais', href: '/funcionario/materiais', icon: ShoppingCartIcon, badgeKey: 'materials' },
  { name: 'Recados', href: '/funcionario/recados', icon: ChatBubbleLeftRightIcon, badgeKey: 'messages' },
  { name: 'Perfil', href: '/funcionario/perfil', icon: UserCircleIcon },
];

export default function FuncionarioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [propertyInfo, setPropertyInfo] = useState<PropertyInfo | null>(null);
  const [stats, setStats] = useState<StaffStats>({
    pendingTasks: 0,
    inProgressTasks: 0,
    unreadMessages: 0,
    materialsWithIssues: 0,
    hasUrgentMaterials: false,
    hasUrgentMessages: false,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'staff') {
      // Se não for staff, redirecionar
      if (session?.user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'staff') {
      fetchNotifications();
      fetchPropertyInfo();
    }
  }, [status, session]);

  const fetchPropertyInfo = async () => {
    try {
      const res = await fetch('/api/property');
      if (res.ok) {
        const data = await res.json();
        setPropertyInfo({
          name: data.name || 'Casa',
          logo: data.logo,
          heroImage: data.heroImage,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar propriedade:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const [tasksRes, messagesRes, suppliesRes] = await Promise.all([
        fetch('/api/staff/tasks'),
        fetch('/api/staff/messages'),
        fetch('/api/staff/supplies'),
      ]);

      let pendingTasks = 0;
      let inProgressTasks = 0;
      if (tasksRes.ok) {
        const tasks = await tasksRes.json();
        if (Array.isArray(tasks)) {
          pendingTasks = tasks.filter((t: any) => t.status === 'pending').length;
          inProgressTasks = tasks.filter((t: any) => t.status === 'in_progress').length;
        }
      }

      let unreadMessages = 0;
      let hasUrgentMessages = false;
      if (messagesRes.ok) {
        const messages = await messagesRes.json();
        const unreadMsgs = messages.filter(
          (m: any) => !m.readBy?.includes(session?.user?.id)
        );
        unreadMessages = unreadMsgs.length;
        hasUrgentMessages = unreadMsgs.some((m: any) => m.priority === 'urgent');
      }

      let materialsWithIssues = 0;
      let hasUrgentMaterials = false;
      if (suppliesRes.ok) {
        const supplies = await suppliesRes.json();
        // Count only out_of_stock (Esgotado) materials for the badge
        const outOfStockSupplies = supplies.filter(
          (s: any) => s.status === 'out_of_stock'
        );
        materialsWithIssues = outOfStockSupplies.length;
        // Show urgency for critical or out_of_stock
        hasUrgentMaterials = supplies.some((s: any) => s.status === 'critical' || s.status === 'out_of_stock');
      }

      setStats({
        pendingTasks,
        inProgressTasks,
        unreadMessages,
        materialsWithIssues,
        hasUrgentMaterials,
        hasUrgentMessages,
      });
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  };

  const getBadgeCount = (key: 'tasks' | 'materials' | 'messages') => {
    switch (key) {
      case 'tasks':
        return stats.pendingTasks + stats.inProgressTasks;
      case 'materials':
        return stats.materialsWithIssues;
      case 'messages':
        return stats.unreadMessages;
      default:
        return 0;
    }
  };

  const hasUrgency = (key: 'tasks' | 'materials' | 'messages') => {
    switch (key) {
      case 'materials':
        return stats.hasUrgentMaterials;
      case 'messages':
        return stats.hasUrgentMessages;
      default:
        return false;
    }
  };

  const getPropertyInitials = () => {
    if (!propertyInfo?.name) return 'CP';
    // Palavras a ignorar: artigos, preposições e pronomes em português
    const ignoreWords = ['a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas', 'de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos', 'para', 'por', 'com', 'sem', 'e', 'ou'];
    return propertyInfo.name
      .split(' ')
      .filter(word => !ignoreWords.includes(word.toLowerCase()))
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'CP';
  };

  const totalNotifications = stats.pendingTasks + stats.inProgressTasks + stats.unreadMessages + stats.materialsWithIssues;

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!session || session.user.role !== 'staff') {
    return null;
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 px-4 flex items-center justify-between shadow-sm">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Bars3Icon className="h-6 w-6 text-slate-600" />
        </button>

        <div className="flex items-center gap-2">
          {propertyInfo?.logo ? (
            <Image
              src={propertyInfo.logo}
              alt={propertyInfo.name}
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{getPropertyInitials()}</span>
            </div>
          )}
          <span className="font-semibold text-slate-800">{propertyInfo?.name || 'Staff Portal'}</span>
        </div>

        <div className="flex items-center gap-2">
          {totalNotifications > 0 && (
            <div className="relative">
              <BellIcon className="h-6 w-6 text-slate-600" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {totalNotifications > 99 ? '99+' : totalNotifications}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              {propertyInfo?.logo ? (
                <Image
                  src={propertyInfo.logo}
                  alt={propertyInfo.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-xl object-cover shadow-lg"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">{getPropertyInitials()}</span>
                </div>
              )}
              <div>
                <h1 className="font-bold text-slate-800">{propertyInfo?.name || 'Casa'}</h1>
                <p className="text-xs text-slate-500">Portal do Funcionário</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              <XMarkIcon className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          {/* User Info */}
          <div className="px-4 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={(session.user as any).staff?.nickname || session.user.name || ''}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {((session.user as any).staff?.nickname || session.user.name)?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">
                  {(session.user as any).staff?.nickname || session.user.name}
                </p>
                <p className="text-xs text-slate-500 capitalize">
                  {(session.user as any).staff?.jobType?.replace('_', ' ') || 'Funcionário'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                const badgeCount = item.badgeKey ? getBadgeCount(item.badgeKey) : 0;
                const showBadge = badgeCount > 0;
                const isUrgent = item.badgeKey ? hasUrgency(item.badgeKey) : false;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium flex-1">{item.name}</span>
                    {showBadge && (
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : item.badgeKey === 'materials'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {badgeCount}
                        </span>
                        {isUrgent && (
                          <div className="relative flex items-center justify-center w-5 h-5">
                            {/* Animated danger indicator */}
                            <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-75"></span>
                            <ExclamationTriangleIcon
                              className={`relative h-5 w-5 ${isActive ? 'text-yellow-300' : 'text-red-500'} animate-bounce`}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-200 space-y-2">
            <Link
              href="/"
              className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
            >
              <GlobeAltIcon className="h-5 w-5" />
              <span className="font-medium">Acessar Site</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
