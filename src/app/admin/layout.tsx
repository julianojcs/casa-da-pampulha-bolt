'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  HomeIcon,
  PhotoIcon,
  MapPinIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  UsersIcon,
  PencilSquareIcon,
  ClipboardDocumentCheckIcon,
  SquaresPlusIcon,
  InformationCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  HomeModernIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  DocumentCheckIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  ShoppingCartIcon,
  ChatBubbleLeftRightIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import { signOut } from 'next-auth/react';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  countKey?: string; // Chave para buscar contador
}

interface MenuGroup {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItem[];
  countKey?: string; // Chave para contador do grupo
}

interface AdminStats {
  users: number;
  guests: number;
  staff: number;
  preRegistrations: number;
  places: number;
  gallery: number;
  faqs: number;
  rooms: number;
  amenities: number;
  usersGroupTotal: number;
  activeReservations: number;
  totalReservations: number;
  pendingTasks: number;
  inProgressTasks: number;
  totalActiveTasks: number;
  pendingSupplies: number;
  activeMessages: number;
  products: number;
}

// New unified menu structure: a single ordered array that may contain MenuItem or MenuGroup
type MenuNode = MenuItem | MenuGroup;

const menuStructure: MenuNode[] = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Calendário', href: '/admin/calendario', icon: CalendarDaysIcon },
  {
    name: 'Propriedade',
    icon: BuildingOfficeIcon,
    items: [
      { name: 'Propriedade', href: '/admin/propriedade', icon: HomeIcon },
      { name: 'Galeria', href: '/admin/galeria', icon: PhotoIcon, countKey: 'gallery' },
      { name: 'Locais', href: '/admin/locais', icon: MapPinIcon, countKey: 'places' },
      { name: 'Comodidades', href: '/admin/comodidades', icon: SquaresPlusIcon, countKey: 'amenities' },
      { name: 'Quartos', href: '/admin/quartos', icon: HomeModernIcon, countKey: 'rooms' },
      { name: 'Área Kids', href: '/admin/kids', icon: SparklesIcon },
      { name: 'FAQs', href: '/admin/faqs', icon: QuestionMarkCircleIcon, countKey: 'faqs' },
      { name: 'Informações', href: '/admin/guest-info', icon: InformationCircleIcon },
    ],
  },
  {
    name: 'Usuários',
    icon: UserGroupIcon,
    countKey: 'usersGroupTotal',
    items: [
      { name: 'Usuários', href: '/admin/usuarios', icon: UsersIcon, countKey: 'users' },
      { name: 'Hóspedes', href: '/admin/hospedes', icon: ClipboardDocumentCheckIcon, countKey: 'guests' },
      { name: 'Pré-cadastros', href: '/admin/pre-cadastros', icon: PencilSquareIcon, countKey: 'preRegistrations' },
    ],
  },
  {
    name: 'Funcionários',
    icon: WrenchScrewdriverIcon,
    countKey: 'staff',
    items: [
      { name: 'Staff', href: '/admin/usuarios?role=staff', icon: UsersIcon, countKey: 'staff' },
      { name: 'Tarefas', href: '/admin/funcionarios/tarefas', icon: ClipboardDocumentListIcon, countKey: 'totalActiveTasks' },
      { name: 'Materiais', href: '/admin/funcionarios/materiais', icon: ShoppingCartIcon, countKey: 'pendingSupplies' },
      { name: 'Recados', href: '/admin/funcionarios/recados', icon: ChatBubbleLeftRightIcon, countKey: 'activeMessages' },
    ],
  },
  { name: 'Produtos', href: '/admin/produtos', icon: CubeIcon, countKey: 'products' },
  { name: 'Reservas', href: '/admin/reservas', icon: DocumentCheckIcon, countKey: 'totalReservations' },
  { name: 'Configurações', href: '/admin/configuracoes', icon: CogIcon },
];

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);

  // Create full path with query params for comparison
  const fullPath = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;

  // Check if a menu item is active (handles query params)
  const isItemActive = (itemHref: string) => {
    if (itemHref.includes('?')) {
      return fullPath === itemHref;
    }
    return pathname === itemHref && !searchParams.toString();
  };

  // Buscar estatísticas
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchStats();
    }
  }, [status, session, fetchStats]);

  // Atualizar stats ao mudar de página
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchStats();
    }
  }, [pathname, status, session, fetchStats]);

  // Encontra o grupo que contém o item ativo
  useEffect(() => {
    for (const node of menuStructure) {
      if ((node as MenuGroup).items && Array.isArray((node as MenuGroup).items)) {
        const group = node as MenuGroup;
        if (group.items.some(item => isItemActive(item.href))) {
          setOpenGroup(group.name);
          break;
        }
      }
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/admin');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  // Fecha sidebar ao mudar de página
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const toggleGroup = (groupName: string) => {
    setOpenGroup(prev => prev === groupName ? null : groupName);
  };

  const getCount = (key?: string): number | undefined => {
    if (!key || !stats) return undefined;
    return stats[key as keyof AdminStats] as number | undefined;
  };

  // Encontrar o item atual para mostrar no header mobile (walk the menuStructure)
  const getCurrentItem = () => {
    for (const node of menuStructure) {
      if ((node as MenuGroup).items && Array.isArray((node as MenuGroup).items)) {
        const group = node as MenuGroup;
        for (const item of group.items) {
          if (isItemActive(item.href)) return item;
        }
      } else {
        const item = node as MenuItem;
        if (isItemActive(item.href)) return item;
      }
    }
    // fallback to first available
    const first = menuStructure[0];
    if ((first as MenuGroup).items && Array.isArray((first as MenuGroup).items)) {
      return (first as MenuGroup).items[0];
    }
    return first as MenuItem;
  };

  const currentItem = getCurrentItem();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-[70] transform transition-transform duration-300 overflow-hidden flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Header do Sidebar */}
        <div className="p-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="text-xl font-bold text-amber-400">
              Admin Panel
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-1">Casa da Pampulha</p>
        </div>

        {/* Navigation com scroll */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* Unified menu structure rendering: items and groups in explicit order */}
          {menuStructure.map((node) => {
            // If the node has an 'items' array it's a group
            if ((node as MenuGroup).items && Array.isArray((node as MenuGroup).items)) {
              const group = node as MenuGroup;
              const isOpen = openGroup === group.name;
              const hasActiveItem = group.items.some(item => isItemActive(item.href));
              return (
                <div key={group.name} className="space-y-1">
                  <button
                    onClick={() => toggleGroup(group.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      hasActiveItem
                        ? 'bg-gray-800 text-amber-400'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <group.icon className="w-5 h-5 flex-shrink-0" />
                      <span>{group.name}</span>
                      {getCount(group.countKey) !== undefined && (
                        <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-amber-600 text-white rounded-full">
                          {getCount(group.countKey)}
                        </span>
                      )}
                    </div>
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-200 ${
                      isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="pl-4 space-y-1 pt-1">
                      {group.items.map((item) => {
                        const isActive = isItemActive(item.href);
                        const itemCount = getCount(item.countKey);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between px-4 py-2 rounded-lg transition-colors text-sm ${
                              isActive
                                ? 'bg-amber-600 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <item.icon className="w-4 h-4 flex-shrink-0" />
                              <span>{item.name}</span>
                            </div>
                            {itemCount !== undefined && (
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-gray-700 text-gray-300'
                              }`}>
                                {itemCount}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            // Otherwise it's a single item
            const item = node as MenuItem;
            const isActive = isItemActive(item.href);
            const itemCount = getCount(item.countKey);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-amber-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </div>
                {itemCount !== undefined && (
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    {itemCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer do Sidebar */}
        <div className="p-4 border-t border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3 mb-4">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || 'Avatar'}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                <UserCircleIcon className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">{session?.user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              <HomeIcon className="w-4 h-4" />
              <span>Site</span>
            </Link>
            <Link
              href="/admin/perfil"
              className="flex items-center justify-center px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              <UserCircleIcon className="w-4 h-4" />
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center justify-center px-3 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors text-sm"
              title="Sair"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Top Bar - Mobile Only */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 lg:hidden">
          <div className="flex items-center px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100"
            >
              <Bars3Icon className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1 flex items-center justify-center gap-2">
              <currentItem.icon className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-gray-800">{currentItem.name}</span>
            </div>
            <div className="w-10" /> {/* Spacer para centralizar */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    }>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}
