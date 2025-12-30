'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  UserIcon,
  CalendarDaysIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Galeria', href: '/galeria' },
  { name: 'Guia Local', href: '/guia-local' },
  { name: 'Comodidades', href: '/comodidades' },
  { name: 'Calendário', href: '/calendario' },
  { name: 'Anfitriões', href: '/anfitrioes' },
  { name: 'Crianças', href: '/criancas' },
  { name: 'Informações', href: '/guest-info' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Sobre', href: '/sobre' }
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [propertyName, setPropertyName] = useState('Casa da Pampulha');
  const pathname = usePathname();
  const { data: session } = useSession();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Determina se está na homepage (onde o header deve ser transparente inicialmente)
  const isHomePage = pathname === '/';
  const useSolidStyle = !isHomePage || isScrolled;

  // Buscar nome da propriedade do banco de dados
  useEffect(() => {
    async function fetchPropertyName() {
      try {
        const res = await fetch('/api/property');
        if (res.ok) {
          const data = await res.json();
          if (data?.name) {
            setPropertyName(data.name);
          }
        }
      } catch (err) {
        console.error('Error fetching property name:', err);
      }
    }
    fetchPropertyName();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsUserMenuOpen(false);
    await signOut({ callbackUrl: '/' });
  };

  // Não renderizar o Header nas páginas do admin (admin tem seu próprio layout)
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        useSolidStyle
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/images/logo.png"
              alt={propertyName}
              width={48}
              height={48}
              className="object-contain"
              priority
            />
            <span
              className={`font-display text-xl font-bold ${
                useSolidStyle ? 'text-gray-800' : 'text-white'
              }`}
            >
              {propertyName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? useSolidStyle
                      ? 'text-amber-600 bg-amber-50'
                      : 'text-amber-400 bg-white/10'
                    : useSolidStyle
                    ? 'text-gray-700 hover:text-amber-600 hover:bg-amber-50'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden lg:flex items-center space-x-3">
            {session ? (
              /* Logged in - User Avatar with Dropdown */
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-colors ${
                    useSolidStyle
                      ? 'hover:bg-gray-100'
                      : 'hover:bg-white/10'
                  }`}
                >
                  {/* Avatar */}
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'Avatar'}
                      width={36}
                      height={36}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center">
                      <UserCircleIcon className="h-6 w-6 text-amber-600" />
                    </div>
                  )}
                  <span
                    className={`text-sm font-medium max-w-[120px] truncate ${
                      useSolidStyle ? 'text-gray-700' : 'text-white'
                    }`}
                  >
                    {session.user.name?.split(' ')[0]}
                  </span>
                  <ChevronDownIcon
                    className={`h-4 w-4 transition-transform ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    } ${useSolidStyle ? 'text-gray-500' : 'text-white/70'}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 border border-gray-100 animate-fade-in">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session.user.email}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      {session.user.role === 'admin' ? (
                        <>
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                          >
                            <Cog6ToothIcon className="h-5 w-5 mr-3" />
                            Painel Admin
                          </Link>
                          <Link
                            href="/admin/perfil"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                          >
                            <UserIcon className="h-5 w-5 mr-3" />
                            Meu Perfil
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/hospede"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                          >
                            <UserIcon className="h-5 w-5 mr-3" />
                            Meu Perfil
                          </Link>
                          <Link
                            href="/hospede/reservas"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                          >
                            <CalendarDaysIcon className="h-5 w-5 mr-3" />
                            Minhas Reservas
                          </Link>
                        </>
                      )}
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Not logged in - Login and Register buttons */
              <div className="flex items-center space-x-2">
                <Link
                  href="/cadastro"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    useSolidStyle
                      ? 'text-gray-700 hover:text-amber-600 hover:bg-amber-50'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Cadastrar
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors shadow-sm"
                >
                  Entrar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2 rounded-lg ${
              useSolidStyle ? 'text-gray-700' : 'text-white'
            }`}
          >
            {isOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden bg-white rounded-lg shadow-lg mt-2 py-4 animate-fade-in">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2 text-sm font-medium ${
                  pathname === item.href
                    ? 'text-amber-600 bg-amber-50'
                    : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50'
                }`}
              >
                {item.name}
              </Link>
            ))}

            <div className="border-t border-gray-200 mt-2 pt-2 px-4">
              {session ? (
                <>
                  {/* User Info Mobile */}
                  <div className="flex items-center space-x-3 py-3 border-b border-gray-100">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'Avatar'}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <UserCircleIcon className="h-6 w-6 text-amber-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                      <p className="text-xs text-gray-500">{session.user.email}</p>
                    </div>
                  </div>

                  {session.user.role === 'admin' ? (
                    <>
                      <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className="block py-2 text-sm font-medium text-gray-700 hover:text-amber-600"
                      >
                        Painel Admin
                      </Link>
                      <Link
                        href="/admin/perfil"
                        onClick={() => setIsOpen(false)}
                        className="block py-2 text-sm font-medium text-gray-700 hover:text-amber-600"
                      >
                        Meu Perfil
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/hospede"
                        onClick={() => setIsOpen(false)}
                        className="block py-2 text-sm font-medium text-gray-700 hover:text-amber-600"
                      >
                        Meu Perfil
                      </Link>
                      <Link
                        href="/hospede/reservas"
                        onClick={() => setIsOpen(false)}
                        className="block py-2 text-sm font-medium text-gray-700 hover:text-amber-600"
                      >
                        Minhas Reservas
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left py-2 text-sm font-medium text-red-600"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <div className="space-y-2 py-2">
                  <Link
                    href="/cadastro"
                    onClick={() => setIsOpen(false)}
                    className="block py-2 text-sm font-medium text-gray-700 hover:text-amber-600"
                  >
                    Cadastrar
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block py-2 text-sm font-medium text-amber-600"
                  >
                    Entrar
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
