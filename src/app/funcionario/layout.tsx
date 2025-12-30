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
} from '@heroicons/react/24/outline';
import { signOut } from 'next-auth/react';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', href: '/funcionario', icon: HomeIcon },
  { name: 'Minhas Tarefas', href: '/funcionario/tarefas', icon: ClipboardDocumentListIcon },
  { name: 'Calendário', href: '/funcionario/calendario', icon: CalendarDaysIcon },
  { name: 'Materiais', href: '/funcionario/materiais', icon: ShoppingCartIcon },
  { name: 'Recados', href: '/funcionario/recados', icon: ChatBubbleLeftRightIcon },
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
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);

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
    }
  }, [status, session]);

  const fetchNotifications = async () => {
    try {
      const [tasksRes, messagesRes] = await Promise.all([
        fetch('/api/staff/tasks?status=pending'),
        fetch('/api/staff/messages'),
      ]);

      if (tasksRes.ok) {
        const tasks = await tasksRes.json();
        setPendingTasks(Array.isArray(tasks) ? tasks.length : 0);
      }

      if (messagesRes.ok) {
        const messages = await messagesRes.json();
        const unread = messages.filter(
          (m: any) => !m.readBy?.includes(session?.user?.id)
        ).length;
        setUnreadMessages(unread);
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  };

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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">CP</span>
          </div>
          <span className="font-semibold text-slate-800">Staff Portal</span>
        </div>

        <div className="flex items-center gap-2">
          {(pendingTasks > 0 || unreadMessages > 0) && (
            <div className="relative">
              <BellIcon className="h-6 w-6 text-slate-600" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingTasks + unreadMessages}
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">CP</span>
              </div>
              <div>
                <h1 className="font-bold text-slate-800">Casa da Pampulha</h1>
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
                  alt={session.user.name || ''}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">
                  {session.user.name}
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
                const showBadge =
                  (item.href === '/funcionario/tarefas' && pendingTasks > 0) ||
                  (item.href === '/funcionario/recados' && unreadMessages > 0);
                const badgeCount =
                  item.href === '/funcionario/tarefas'
                    ? pendingTasks
                    : item.href === '/funcionario/recados'
                    ? unreadMessages
                    : 0;

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
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {badgeCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-200">
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
