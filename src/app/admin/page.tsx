'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  PhotoIcon,
  MapPinIcon,
  UsersIcon,
  QuestionMarkCircleIcon,
  HomeIcon,
  EyeIcon,
  CalendarDaysIcon,
  UserIcon,
  PhoneIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { formatPhone } from '@/lib/helpers';

interface Stats {
  places: number;
  gallery: number;
  faqs: number;
  guests: number;
}

interface MaterialAlert {
  _id: string;
  name: string;
  status: 'critical' | 'out_of_stock';
  category: string;
}

interface ReservationData {
  _id: string;
  guestName: string;
  guestPhone: string;
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
  numberOfGuests?: number;
  status: string;
  guest?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    places: 0,
    gallery: 0,
    faqs: 0,
    guests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentReservation, setCurrentReservation] = useState<ReservationData | null>(null);
  const [nextReservation, setNextReservation] = useState<ReservationData | null>(null);
  const [materialAlerts, setMaterialAlerts] = useState<MaterialAlert[]>([]);

  const [property, setProperty] = useState<any>(null);
  const [airbnbUrl, setAirbnbUrl] = useState<string>('https://www.airbnb.com.br');

  useEffect(() => {
    fetchStats();
    fetchProperty();
    fetchCurrentReservation();
    fetchMaterialAlerts();
  }, []);

  const fetchMaterialAlerts = async () => {
    try {
      const res = await fetch('/api/staff/supplies');
      if (res.ok) {
        const supplies = await res.json();
        const alerts = supplies.filter(
          (s: any) => s.status === 'critical' || s.status === 'out_of_stock'
        ).map((s: any) => ({
          _id: s._id,
          name: s.name,
          status: s.status,
          category: s.category,
        }));
        setMaterialAlerts(alerts);
      }
    } catch (error) {
      console.error('Erro ao buscar alertas de materiais:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const [placesRes, galleryRes, faqsRes, guestsRes] = await Promise.all([
        fetch('/api/places'),
        fetch('/api/gallery'),
        fetch('/api/faq'),
        fetch('/api/guests'),
      ]);

      const [places, gallery, faqs, guests] = await Promise.all([
        placesRes.json(),
        galleryRes.json(),
        faqsRes.json(),
        guestsRes.json(),
      ]);

      setStats({
        places: Array.isArray(places) ? places.length : 0,
        gallery: Array.isArray(gallery) ? gallery.length : 0,
        faqs: Array.isArray(faqs) ? faqs.length : 0,
        guests: Array.isArray(guests) ? guests.length : 0,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentReservation = async () => {
    try {
      const res = await fetch('/api/reservations/current');
      if (!res.ok) return;
      const data = await res.json();
      setCurrentReservation(data.current || null);
      setNextReservation(data.next || null);
    } catch (error) {
      console.error('Erro ao carregar reserva atual:', error);
    }
  };

  const fetchProperty = async () => {
    try {
      const res = await fetch('/api/property');
      if (!res.ok) return;
      const data = await res.json();
      setProperty(data || null);
      if (data?.airbnbUrl) setAirbnbUrl(data.airbnbUrl);
    } catch (error) {
      console.error('Erro ao carregar propriedade:', error);
    }
  };

  const statCards = [
    {
      name: 'Locais Cadastrados',
      value: stats.places,
      icon: MapPinIcon,
      color: 'bg-blue-500',
      href: '/admin/locais'
    },
    {
      name: 'Fotos na Galeria',
      value: stats.gallery,
      icon: PhotoIcon,
      color: 'bg-purple-500',
      href: '/admin/galeria'
    },
    {
      name: 'FAQs',
      value: stats.faqs,
      icon: QuestionMarkCircleIcon,
      color: 'bg-teal-500',
      href: '/admin/faqs'
    },
    {
      name: 'Hóspedes Registrados',
      value: stats.guests,
      icon: UsersIcon,
      color: 'bg-amber-500',
      href: '/admin/hospedes'
    },
  ];

  const formatDate = (date: Date | string) => {
    // Extract just the date part (YYYY-MM-DD) to avoid timezone issues
    const dateStr = typeof date === 'string' ? date : date.toISOString();
    const datePart = dateStr.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    return localDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getDaysRemaining = (date: Date | string) => {
    // Convert to string and extract just the date part (YYYY-MM-DD)
    const dateStr = typeof date === 'string' ? date : date.toISOString();
    const datePart = dateStr.split('T')[0]; // Get "YYYY-MM-DD"
    const [year, month, day] = datePart.split('-').map(Number);

    // Get today's date in local timezone
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth() + 1; // getMonth() is 0-indexed
    const todayDay = now.getDate();

    // Create dates at noon to avoid any DST issues
    const targetDate = new Date(year, month - 1, day, 12, 0, 0, 0);
    const todayDate = new Date(todayYear, todayMonth - 1, todayDay, 12, 0, 0, 0);

    // Calculate difference in days
    const diffTime = targetDate.getTime() - todayDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral do seu site</p>
      </div>

      {/* Reserva Atual (Hero) */}
      {currentReservation && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="h-6 w-6" />
              <h2 className="text-xl font-bold">Reserva em Andamento</h2>
            </div>
            <a
              href="/admin/reservas"
              className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors"
            >
              Ver todas
            </a>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              {currentReservation.guest?.avatar ? (
                <Image
                  src={currentReservation.guest.avatar}
                  alt={currentReservation.guestName}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/30"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <UserIcon className="h-8 w-8" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold">{currentReservation.guestName}</h3>
                <p className="text-amber-100 flex items-center gap-1">
                  <PhoneIcon className="h-4 w-4" />
                  {formatPhone(currentReservation.guestPhone)}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5" />
                <span>
                  Check-in: {formatDate(currentReservation.checkInDate)} às {currentReservation.checkInTime}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5" />
                <span>
                  Check-out: {formatDate(currentReservation.checkOutDate)} às {currentReservation.checkOutTime}
                </span>
              </div>
              {currentReservation.numberOfGuests && currentReservation.numberOfGuests > 0 && (
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-5 w-5" />
                  <span>
                    {currentReservation.numberOfGuests} hóspede{currentReservation.numberOfGuests > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
          {getDaysRemaining(currentReservation.checkOutDate) <= 1 && (
            <div className="mt-4 bg-white/20 rounded-lg p-3 text-sm">
              ⚠️ Check-out {getDaysRemaining(currentReservation.checkOutDate) === 0 ? 'hoje' : 'amanhã'}!
            </div>
          )}
        </div>
      )}

      {/* Próxima Reserva (quando não há atual) */}
      {!currentReservation && nextReservation && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="h-6 w-6" />
              <h2 className="text-xl font-bold">Próxima Reserva</h2>
              <span className="text-blue-100 text-sm">
                ({getDaysRemaining(nextReservation.checkInDate) === 0 ? 'hoje' : getDaysRemaining(nextReservation.checkInDate) === 1 ? 'amanhã' : `em ${getDaysRemaining(nextReservation.checkInDate)} dias`})
              </span>
            </div>
            <a
              href="/admin/reservas"
              className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors"
            >
              Ver todas
            </a>
          </div>
          <div className="flex items-center gap-4">
            {nextReservation.guest?.avatar ? (
              <Image
                src={nextReservation.guest.avatar}
                alt={nextReservation.guestName}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <UserIcon className="h-6 w-6" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold">{nextReservation.guestName}</h3>
              <p className="text-blue-100">
                {formatDate(nextReservation.checkInDate)} - {formatDate(nextReservation.checkOutDate)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Material Alerts */}
      {materialAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-rose-100 to-orange-100 border border-rose-200 rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-6 w-6 text-rose-600" />
              <h2 className="text-xl font-bold text-rose-800">Alertas de Materiais</h2>
              <span className="ml-2 px-2 py-0.5 bg-rose-200 text-rose-700 rounded-full text-sm font-medium">
                {materialAlerts.length}
              </span>
            </div>
            <Link
              href="/admin/funcionarios/materiais"
              className="text-sm bg-rose-200 hover:bg-rose-300 text-rose-700 px-3 py-1 rounded-lg transition-colors"
            >
              Ver todos
            </Link>
          </div>
          <div className="grid gap-2">
            {materialAlerts.slice(0, 5).map((alert) => (
              <div
                key={alert._id}
                className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-rose-100"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCartIcon className="h-5 w-5 text-rose-500" />
                  <span className="font-medium text-slate-700">{alert.name}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  alert.status === 'out_of_stock'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {alert.status === 'out_of_stock' ? 'Esgotado' : 'Crítico'}
                </span>
              </div>
            ))}
            {materialAlerts.length > 5 && (
              <p className="text-rose-600 text-sm text-center mt-2">
                + {materialAlerts.length - 5} outros materiais
              </p>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <a
            key={stat.name}
            href={stat.href}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.name}</p>
                {loading ? (
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                )}
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Ações Rápidas</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/admin/galeria"
            className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <PhotoIcon className="w-6 h-6 text-purple-600" />
            <span className="font-medium text-gray-800">Adicionar Foto</span>
          </a>
          <a
            href="/admin/locais"
            className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <MapPinIcon className="w-6 h-6 text-blue-600" />
            <span className="font-medium text-gray-800">Adicionar Local</span>
          </a>
          <a
            href="/admin/faqs"
            className="flex items-center space-x-3 p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
          >
            <QuestionMarkCircleIcon className="w-6 h-6 text-teal-600" />
            <span className="font-medium text-gray-800">Adicionar FAQ</span>
          </a>
          <a
            href="/"
            target="_blank"
            className="flex items-center space-x-3 p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
          >
            <EyeIcon className="w-6 h-6 text-amber-600" />
            <span className="font-medium text-gray-800">Ver Site</span>
          </a>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Propriedade</h2>
          <div className="space-y-3 text-gray-600">
            <p><span className="font-medium">Nome:</span> {property?.name || 'Casa da Pampulha'}</p>
            <p><span className="font-medium">Localização:</span> {property ? `${property.address}${property.city ? ', ' + property.city : ''}` : 'Pampulha, BH'}</p>
            <p><span className="font-medium">Capacidade:</span> {property?.maxGuests ?? 16} hóspedes</p>
            <p><span className="font-medium">Quartos:</span> {property?.bedrooms ?? 5}</p>
          </div>
          <a
            href="/admin/propriedade"
            className="inline-block mt-4 text-amber-600 hover:text-amber-700 font-medium"
          >
            Editar propriedade →
          </a>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Links Úteis</h2>
          <div className="space-y-3">
            <a
              href={property?.airbnbUrl || 'https://www.airbnb.com.br'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-600 hover:text-amber-600"
            >
              <HomeIcon className="w-5 h-5" />
              <span>Airbnb</span>
            </a>
            <a
              href="/guia-local"
              target="_blank"
              className="flex items-center space-x-2 text-gray-600 hover:text-amber-600"
            >
              <MapPinIcon className="w-5 h-5" />
              <span>Ver Guia Local</span>
            </a>
            <a
              href="/galeria"
              target="_blank"
              className="flex items-center space-x-2 text-gray-600 hover:text-amber-600"
            >
              <PhotoIcon className="w-5 h-5" />
              <span>Ver Galeria</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
