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
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface PropertyInfo {
  whatsapp?: string;
  airbnbUrl?: string;
}

interface Reservation {
  _id: string;
  checkInDate: string;
  checkOutDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'pending' | 'upcoming' | 'current' | 'completed' | 'cancelled';
  guestName?: string;
  numberOfGuests?: number;
}

export default function HospedeDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [property, setProperty] = useState<PropertyInfo | null>(null);
  const [currentReservation, setCurrentReservation] = useState<Reservation | null>(null);
  const [nextReservation, setNextReservation] = useState<Reservation | null>(null);
  const [loadingReservations, setLoadingReservations] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Buscar dados da propriedade para WhatsApp
    fetch('/api/property')
      .then(res => res.json())
      .then(data => setProperty(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Buscar reservas do usuário
    if (status === 'authenticated') {
      fetchReservations();
    }
  }, [status]);

  const fetchReservations = async () => {
    try {
      const response = await fetch('/api/user/reservations');
      const data = await response.json();

      if (response.ok && data.reservations) {
        const now = new Date();
        const reservations = data.reservations as Reservation[];

        // Encontrar reserva atual (em andamento)
        const current = reservations.find(r => {
          const checkIn = new Date(r.checkInDate);
          const checkOut = new Date(r.checkOutDate);
          return r.status === 'current' || (now >= checkIn && now <= checkOut && r.status !== 'cancelled');
        });

        // Encontrar próxima reserva
        const upcoming = reservations
          .filter(r => {
            const checkIn = new Date(r.checkInDate);
            return checkIn > now && (r.status === 'upcoming' || r.status === 'pending');
          })
          .sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime())[0];

        setCurrentReservation(current || null);
        setNextReservation(upcoming || null);
      }
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
    } finally {
      setLoadingReservations(false);
    }
  };

  const getWhatsAppUrl = (): string | null => {
    if (!property?.whatsapp) return null;
    const digits = property.whatsapp.replace(/\D/g, '');
    return `https://wa.me/${digits}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysUntil = (dateStr: string) => {
    const now = new Date();
    const target = new Date(dateStr);
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getReservationDisplay = () => {
    if (loadingReservations) {
      return {
        title: 'Carregando...',
        subtitle: '',
        status: 'loading',
      };
    }

    if (currentReservation) {
      const daysLeft = getDaysUntil(currentReservation.checkOutDate);
      return {
        title: 'Reserva em Andamento',
        subtitle: `Check-out em ${daysLeft} dia${daysLeft !== 1 ? 's' : ''} - ${formatDate(currentReservation.checkOutDate)}`,
        status: 'current',
        reservation: currentReservation,
      };
    }

    if (nextReservation) {
      const daysUntil = getDaysUntil(nextReservation.checkInDate);
      const statusLabel = nextReservation.status === 'pending' ? 'Pendente' : 'Confirmada';
      return {
        title: `Próxima Reserva (${statusLabel})`,
        subtitle: daysUntil === 0
          ? 'Check-in hoje!'
          : daysUntil === 1
            ? 'Check-in amanhã'
            : `Check-in em ${daysUntil} dias - ${formatDate(nextReservation.checkInDate)}`,
        status: nextReservation.status,
        reservation: nextReservation,
      };
    }

    return {
      title: 'Nenhuma reserva',
      subtitle: 'Você não tem reservas ativas',
      status: 'none',
    };
  };

  const reservationDisplay = getReservationDisplay();
  const whatsappUrl = getWhatsAppUrl();

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

          {/* Reservation Info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`rounded-xl p-4 ${
              reservationDisplay.status === 'current'
                ? 'bg-green-500/30'
                : reservationDisplay.status === 'pending'
                  ? 'bg-amber-300/30'
                  : reservationDisplay.status === 'upcoming'
                    ? 'bg-blue-500/30'
                    : 'bg-white/10'
            }`}>
              <div className="flex items-center gap-2 text-amber-100 text-sm mb-1">
                {reservationDisplay.status === 'current' ? (
                  <CheckCircleIcon className="h-4 w-4" />
                ) : (
                  <CalendarIcon className="h-4 w-4" />
                )}
                {reservationDisplay.title}
              </div>
              <p className="font-medium">{reservationDisplay.subtitle}</p>
              {reservationDisplay.reservation && (
                <div className="mt-2 text-sm text-amber-100">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    <span>
                      {formatDate(reservationDisplay.reservation.checkInDate)} → {formatDate(reservationDisplay.reservation.checkOutDate)}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-100 text-sm mb-1">
                <HomeIcon className="h-4 w-4" />
                Status da Conta
              </div>
              <p className="font-medium">Conta Ativa</p>
              <Link
                href="/hospede/reservas"
                className="mt-2 inline-flex items-center gap-1 text-sm text-amber-100 hover:text-white"
              >
                Ver todas as reservas
                <ChevronRightIcon className="h-4 w-4" />
              </Link>
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
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
