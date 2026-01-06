'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  formatLocalDate,
  daysUntil,
  isCurrentReservation,
  isUpcomingReservation,
  parseLocalDate,
} from '@/utils/dateUtils';
import {
  UserCircleIcon,
  CalendarIcon,
  UsersIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  HomeIcon,
  ClockIcon,
  CheckCircleIcon,
  MapPinIcon,
  WifiIcon,
  KeyIcon,
  PhoneIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  MapIcon,
} from '@heroicons/react/24/outline';

interface PropertyInfo {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  whatsapp?: string;
  phone?: string;
  phoneVisibility?: 'public' | 'restricted' | 'private';
  email?: string;
  airbnbUrl?: string;
  doorPasswords?: { location: string; password: string; notes?: string }[];
  doorPasswordConfig?: {
    showToGuests: boolean;
    addHashSuffix: boolean;
    hashSuffixNote: string;
  };
  wifiPasswords?: { network: string; password: string }[];
}

interface GuestInfo {
  _id: string;
  type: 'checkin' | 'checkout' | 'rule' | 'instruction';
  title: string;
  content: string;
  icon?: string;
  order: number;
  isRestricted: boolean;
  showOnGuestDashboard: boolean;
  isActive: boolean;
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
  temporaryMainDoorPassword?: {
    location: string;
    password: string;
    notes?: string;
  };
}

export default function HospedeDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [property, setProperty] = useState<PropertyInfo | null>(null);
  const [guestInfos, setGuestInfos] = useState<GuestInfo[]>([]);
  const [currentReservation, setCurrentReservation] = useState<Reservation | null>(null);
  const [nextReservation, setNextReservation] = useState<Reservation | null>(null);
  const [loadingReservations, setLoadingReservations] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Buscar dados da propriedade
    fetch('/api/property')
      .then(res => res.json())
      .then(data => setProperty(data))
      .catch(() => {});

    // Buscar informações do hóspede (regras, instruções)
    fetch('/api/guest-info?dashboard=true')
      .then(res => res.json())
      .then(data => {
        if (data.items) {
          setGuestInfos(data.items);
        }
      })
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
        const reservations = data.reservations as Reservation[];

        // Encontrar reserva atual (em andamento) - usando funções com timezone correto
        const current = reservations.find(r => {
          return r.status === 'current' ||
            (isCurrentReservation(r.checkInDate, r.checkOutDate) && r.status !== 'cancelled');
        });

        // Encontrar próxima reserva
        const upcoming = reservations
          .filter(r => {
            return isUpcomingReservation(r.checkInDate) &&
              (r.status === 'upcoming' || r.status === 'pending');
          })
          .sort((a, b) => parseLocalDate(a.checkInDate).getTime() - parseLocalDate(b.checkInDate).getTime())[0];

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

  // Use imported formatLocalDate and daysUntil from dateUtils
  const formatDate = (dateStr: string) => formatLocalDate(dateStr);
  const getDaysUntil = (dateStr: string) => daysUntil(dateStr);

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

  // Filter guest infos by type
  const checkinInfos = guestInfos.filter(info => info.type === 'checkin' && info.showOnGuestDashboard);
  const checkoutInfos = guestInfos.filter(info => info.type === 'checkout' && info.showOnGuestDashboard);
  const rulesInfos = guestInfos.filter(info => info.type === 'rule' && info.showOnGuestDashboard);
  const instructionInfos = guestInfos.filter(info => info.type === 'instruction' && info.showOnGuestDashboard);

  const reservationDisplay = getReservationDisplay();
  const whatsappUrl = getWhatsAppUrl();
  const hasActiveReservation = currentReservation || nextReservation;

  // Check if phone should be shown based on visibility
  const shouldShowPhone = property?.phone && (
    property.phoneVisibility === 'public' ||
    (property.phoneVisibility === 'restricted' && hasActiveReservation)
  );

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
      color: 'bg-slate-100 text-slate-600',
    },
    {
      title: 'Minhas Reservas',
      description: 'Veja suas reservas e histórico',
      icon: CalendarIcon,
      href: '/hospede/reservas',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Meus Convidados',
      description: 'Cadastre hóspedes e veículos da reserva',
      icon: UsersIcon,
      href: '/hospede/convidados',
      color: 'bg-emerald-100 text-emerald-600',
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
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-6 md:p-8 text-white mb-8">
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
              <p className="text-slate-300 text-sm">Bem-vindo(a) de volta,</p>
              <h1 className="text-2xl font-bold">{session.user?.name}</h1>
            </div>
          </div>

          {/* Reservation Info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`rounded-xl p-4 ${
              reservationDisplay.status === 'current'
                ? 'bg-emerald-500/30'
                : reservationDisplay.status === 'pending'
                  ? 'bg-amber-500/30'
                  : reservationDisplay.status === 'upcoming'
                    ? 'bg-blue-500/30'
                    : 'bg-white/10'
            }`}>
              <div className="flex items-center gap-2 text-slate-300 text-sm mb-1">
                {reservationDisplay.status === 'current' ? (
                  <CheckCircleIcon className="h-4 w-4" />
                ) : (
                  <CalendarIcon className="h-4 w-4" />
                )}
                {reservationDisplay.title}
              </div>
              <p className="font-medium">{reservationDisplay.subtitle}</p>
              {reservationDisplay.reservation && (
                <div className="mt-2 text-sm text-slate-300">
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
              <div className="flex items-center gap-2 text-slate-300 text-sm mb-1">
                <HomeIcon className="h-4 w-4" />
                Status da Conta
              </div>
              <p className="font-medium">Conta Ativa</p>
              <Link
                href="/hospede/reservas"
                className="mt-2 inline-flex items-center gap-1 text-sm text-slate-300 hover:text-white"
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

        {/* Guia Local Card */}
        <div className="mt-8">
          <Link
            href="/guia-local"
            className="block bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <MapIcon className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold">Guia Local</h3>
                <p className="text-blue-100 mt-1">
                  Descubra restaurantes, atrações, supermercados e serviços próximos
                </p>
              </div>
              <ChevronRightIcon className="h-6 w-6 text-white/70 group-hover:text-white transition-colors" />
            </div>
          </Link>
        </div>

        {/* Property Address & Contacts */}
        {property && (
          <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <HomeIcon className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-gray-800">Endereço e Contato</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Address */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPinIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Endereço</span>
                </div>
                <p className="text-gray-800">
                  {property.address}
                  {property.city && `, ${property.city}`}
                  {property.state && ` - ${property.state}`}
                </p>
              </div>

              {/* Host Contacts */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <PhoneIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Contatos do Anfitrião</span>
                </div>
                <div className="space-y-1">
                  {shouldShowPhone && (
                    <p className="text-gray-800">
                      <span className="text-gray-500">Tel:</span> {property.phone}
                    </p>
                  )}
                  {property.whatsapp && (
                    <a
                      href={whatsappUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 flex items-center gap-1"
                    >
                      <span className="text-gray-500">WhatsApp:</span> {property.whatsapp}
                    </a>
                  )}
                  {property.email && (
                    <p className="text-gray-800">
                      <span className="text-gray-500">Email:</span> {property.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WiFi & Door Passwords - Only show when guest has active reservation */}
        {hasActiveReservation && (property?.wifiPasswords?.length || property?.doorPasswords?.length) && (
          <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <KeyIcon className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-gray-800">Senhas de Acesso</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* WiFi Passwords */}
              {property?.wifiPasswords && property.wifiPasswords.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-700 mb-3">
                    <WifiIcon className="h-5 w-5" />
                    <span className="font-medium">WiFi</span>
                  </div>
                  <div className="space-y-3">
                    {property.wifiPasswords.map((wifi, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3">
                        <p className="text-sm text-gray-500">Rede</p>
                        <p className="font-medium text-gray-800">{wifi.network}</p>
                        <p className="text-sm text-gray-500 mt-2">Senha</p>
                        <p className="font-mono font-bold text-blue-600 text-lg">{wifi.password}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Door Passwords */}
              {property?.doorPasswords && property.doorPasswords.length > 0 && (
                <div className="bg-amber-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-amber-700 mb-3">
                    <KeyIcon className="h-5 w-5" />
                    <span className="font-medium">Portas</span>
                  </div>
                  <div className="space-y-3">
                    {property.doorPasswords.map((door, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3">
                        <p className="text-sm text-gray-500">{door.location}</p>
                        <p className="font-mono font-bold text-amber-600 text-lg">{door.password}</p>
                        {door.notes && (
                          <p className="text-xs text-gray-500 mt-1">{door.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Temporary Door Password from Reservation */}
              {currentReservation?.temporaryMainDoorPassword?.password &&
               property?.doorPasswordConfig?.showToGuests !== false && (
                <div className="bg-rose-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-rose-700 mb-3">
                    <KeyIcon className="h-5 w-5" />
                    <span className="font-medium">Senha Temporária da Porta</span>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-500">
                      {currentReservation.temporaryMainDoorPassword.location}
                    </p>
                    <p className="font-mono font-bold text-rose-600 text-lg">
                      {currentReservation.temporaryMainDoorPassword.password}
                      {property?.doorPasswordConfig?.addHashSuffix && (
                        <span className="text-fuchsia-700">#</span>
                      )}
                    </p>
                    {property?.doorPasswordConfig?.addHashSuffix && property?.doorPasswordConfig?.hashSuffixNote && (
                      <p className="text-xs text-rose-500 mt-1 font-medium">⚠️ {property.doorPasswordConfig.hashSuffixNote}</p>
                    )}
                    {currentReservation.temporaryMainDoorPassword.notes && (
                      <p className="text-xs text-gray-500 mt-1">
                        💡 {currentReservation.temporaryMainDoorPassword.notes}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Check-in Information */}
        {checkinInfos.length > 0 && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-800">Informações de Check-in</h3>
            </div>
            <div className="space-y-3">
              {checkinInfos.map((info) => (
                <div key={info._id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-100">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">{info.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{info.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Check-out Information */}
        {checkoutInfos.length > 0 && (
          <div className="mt-8 bg-orange-50 border border-orange-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-orange-800">Informações de Check-out</h3>
            </div>
            <div className="space-y-3">
              {checkoutInfos.map((info) => (
                <div key={info._id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-orange-100">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">{info.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{info.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rules */}
        {rulesInfos.length > 0 && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-800">Regras</h3>
            </div>
            <div className="space-y-3">
              {rulesInfos.map((info) => (
                <div key={info._id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-100">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">{info.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{info.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {instructionInfos.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <InformationCircleIcon className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800">Instruções</h3>
            </div>
            <div className="space-y-3">
              {instructionInfos.map((info) => (
                <div key={info._id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">{info.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{info.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
