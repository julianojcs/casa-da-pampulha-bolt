'use client';

import { useEffect, useState } from 'react';
import {
  PhotoIcon,
  MapPinIcon,
  UsersIcon,
  QuestionMarkCircleIcon,
  HomeIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface Stats {
  places: number;
  gallery: number;
  faqs: number;
  guests: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    places: 0,
    gallery: 0,
    faqs: 0,
    guests: 0,
  });
  const [loading, setLoading] = useState(true);

  const [property, setProperty] = useState<any>(null);
  const [airbnbUrl, setAirbnbUrl] = useState<string>('https://www.airbnb.com.br');

  useEffect(() => {
    fetchStats();
    fetchProperty();
  }, []);

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral do seu site</p>
      </div>

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
