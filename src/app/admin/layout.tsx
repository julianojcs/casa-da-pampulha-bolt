'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  HomeIcon,
  PhotoIcon,
  MapPinIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  UsersIcon,
  ClipboardDocumentCheckIcon,
  SquaresPlusIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  HomeModernIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { signOut } from 'next-auth/react';

const sidebarItems = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Propriedade', href: '/admin/propriedade', icon: HomeIcon },
  { name: 'Galeria', href: '/admin/galeria', icon: PhotoIcon },
  { name: 'Locais', href: '/admin/locais', icon: MapPinIcon },
  { name: 'Comodidades', href: '/admin/comodidades', icon: SquaresPlusIcon },
  { name: 'Quartos', href: '/admin/quartos', icon: HomeModernIcon },
  { name: 'FAQs', href: '/admin/faqs', icon: QuestionMarkCircleIcon },
  { name: 'Usuários', href: '/admin/usuarios', icon: UsersIcon },
  { name: 'Hóspedes', href: '/admin/hospedes', icon: ClipboardDocumentCheckIcon },
  { name: 'Pré-cadastros', href: '/admin/pre-cadastros', icon: ClipboardDocumentCheckIcon },
  { name: 'Informações', href: '/admin/guest-info', icon: ClipboardDocumentCheckIcon },
  { name: 'Área Kids', href: '/admin/kids', icon: SparklesIcon },
  { name: 'Configurações', href: '/admin/configuracoes', icon: CogIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Encontrar o item atual para mostrar no header mobile
  const currentItem = sidebarItems.find(item => item.href === pathname) || sidebarItems[0];

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
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-amber-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
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
