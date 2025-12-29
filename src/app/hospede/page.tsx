'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  UserCircleIcon,
  CalendarIcon,
  TruckIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';

export default function HospedeDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const menuItems = [
    {
      title: 'Meu Perfil',
      description: 'Gerencie seus dados pessoais e senha',
      icon: UserCircleIcon,
      href: '/hospede/perfil',
      color: 'bg-amber-100 text-amber-600',
    },
    {
      title: 'Minhas Reservas',
      description: 'Veja suas reservas e histórico',
      icon: CalendarIcon,
      href: '/hospede/reservas',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Meus Veículos',
      description: 'Cadastre os veículos da sua estadia',
      icon: TruckIcon,
      href: '/hospede/veiculos',
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Documentos',
      description: 'Envie documentos e fotos',
      icon: DocumentTextIcon,
      href: '/hospede/documentos',
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 md:p-8 text-white mb-8">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white/20">
              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || ''}
                  fill
                  className="object-cover"
                />
              ) : (
                <UserCircleIcon className="w-16 h-16 text-white/70" />
              )}
            </div>
            <div>
              <p className="text-amber-100 text-sm">Bem-vindo(a) de volta,</p>
              <h1 className="text-2xl font-bold">{session.user?.name}</h1>
            </div>
          </div>

          {/* Quick Info */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-100 text-sm mb-1">
                <CalendarIcon className="h-4 w-4" />
                Próxima Reserva
              </div>
              <p className="font-medium">Nenhuma reserva</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-100 text-sm mb-1">
                <HomeIcon className="h-4 w-4" />
                Status
              </div>
              <p className="font-medium">Conta Ativa</p>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${item.color}`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 group-hover:text-amber-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        {/* Help Card */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-2">Precisa de ajuda?</h3>
          <p className="text-sm text-gray-500 mb-4">
            Entre em contato conosco pelo WhatsApp ou acesse nossas perguntas frequentes.
          </p>
          <div className="flex gap-3">
            <Link
              href="/faq"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Ver FAQ
            </Link>
            <Link
              href="/contato"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              WhatsApp
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
