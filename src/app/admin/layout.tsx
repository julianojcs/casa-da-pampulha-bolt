'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  SparklesIcon
} from '@heroicons/react/24/outline';
import { signOut } from 'next-auth/react';

const sidebarItems = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Propriedade', href: '/admin/propriedade', icon: HomeIcon },
  { name: 'Galeria', href: '/admin/galeria', icon: PhotoIcon },
  { name: 'Locais', href: '/admin/locais', icon: MapPinIcon },
  { name: 'Comodidades', href: '/admin/comodidades', icon: SquaresPlusIcon },
  { name: 'FAQs', href: '/admin/faqs', icon: QuestionMarkCircleIcon },
  { name: 'Hóspedes', href: '/admin/hospedes', icon: UsersIcon },
  { name: 'Check-in', href: '/admin/checkin', icon: ClipboardDocumentCheckIcon },
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/admin');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-50 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-4 border-b border-gray-800">
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

        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium text-white">{session?.user?.name}</p>
              <p className="text-sm text-gray-400">{session?.user?.email}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              <HomeIcon className="w-4 h-4" />
              <span>Ver Site</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center justify-center px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Bars3Icon className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1 lg:hidden text-center">
              <span className="font-bold text-gray-800">Admin</span>
            </div>
            <div className="lg:flex-1" />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8 mt-12">
          {children}
        </main>
      </div>
    </div>
  );
}
