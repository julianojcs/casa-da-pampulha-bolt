'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Início', href: '/' },
  { name: 'Sobre', href: '/sobre' },
  { name: 'Galeria', href: '/galeria' },
  { name: 'Guia Local', href: '/guia-local' },
  { name: 'Comodidades', href: '/comodidades' },
  { name: 'Anfitriões', href: '/anfitrioes' },
  { name: 'Crianças', href: '/criancas' },
  { name: 'Check-in', href: '/checkin' },
  { name: 'FAQ', href: '/faq' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  // Determina se está na homepage (onde o header deve ser transparente inicialmente)
  const isHomePage = pathname === '/';
  // Se não está na homepage, ou se scrollou, usa estilo sólido
  const useSolidStyle = !isHomePage || isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
              src={useSolidStyle ? "/images/logo.png" : "/images/logo.png"}
              alt="Casa da Pampulha"
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
              Casa da Pampulha
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
          <div className="hidden lg:flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-3">
                <Link
                  href={session.user.role === 'admin' ? '/admin' : '/hospede'}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium ${
                    useSolidStyle
                      ? 'text-gray-700 hover:text-amber-600'
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  <UserCircleIcon className="h-5 w-5" />
                  <span>{session.user.name}</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium ${
                    useSolidStyle
                      ? 'text-gray-700 hover:text-red-600'
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="btn-primary text-sm"
              >
                Entrar
              </Link>
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
                  <Link
                    href={session.user.role === 'admin' ? '/admin' : '/hospede'}
                    className="block py-2 text-sm font-medium text-gray-700"
                  >
                    Minha Conta
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="block w-full text-left py-2 text-sm font-medium text-red-600"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block py-2 text-sm font-medium text-amber-600"
                >
                  Entrar
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
