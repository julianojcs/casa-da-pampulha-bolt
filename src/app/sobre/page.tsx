'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FaBed, FaBath, FaUsers, FaMapMarkerAlt, FaStar, FaSwimmingPool,
  FaHotTub, FaWifi, FaParking, FaChild
} from 'react-icons/fa';

interface Property {
  _id: string;
  name: string;
  tagline: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  checkInTime: string;
  checkOutTime: string;
  minNights: number;
  airbnbUrl: string;
  heroImage: string;
  heroImages: string[];
}

export default function SobrePage() {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperty();
  }, []);

  const fetchProperty = async () => {
    try {
      const response = await fetch('/api/property');
      const data = await response.json();
      console.log('Propriedade carregada:', data);
      if (data) {
        setProperty(data);
      }
    } catch (error) {
      console.error('Erro ao carregar propriedade:', error);
    } finally {
      setLoading(false);
    }
  };

  const highlights = [
    { icon: FaSwimmingPool, label: 'Piscina Aquecida', description: 'Com aquecimento solar' },
    { icon: FaHotTub, label: 'Jacuzzi', description: 'Para relaxar' },
    { icon: FaChild, label: 'Playground', description: 'Área para crianças' },
    { icon: FaWifi, label: 'Wi-Fi', description: 'Alta velocidade' },
    { icon: FaParking, label: 'Estacionamento', description: 'Para 5 veículos' },
  ];

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px]">
        <div className="absolute inset-0">
          {property &&
            <Image
              src={property.heroImage}
              alt="Casa da Pampulha"
              fill
              className="object-cover"
              priority
            />
          }
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-2 text-amber-400 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar key={star} className="w-5 h-5" />
              ))}
              <span className="text-white ml-2">Superhost</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4">
              {property?.name}
            </h1>
            <p className="text-xl text-white/90 mb-4">
              {property?.tagline}
            </p>
            <div className="flex items-center text-white/80">
              <FaMapMarkerAlt className="mr-2" />
              <span>
                {property?.address}, {property?.city} - {property?.state}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center space-x-3">
              <FaUsers className="w-6 h-6 text-amber-500" />
              <div>
                <p className="font-bold text-gray-800">{property?.maxGuests || 16} hóspedes</p>
                <p className="text-sm text-gray-500">Capacidade máxima</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaBed className="w-6 h-6 text-amber-500" />
              <div>
                <p className="font-bold text-gray-800">{property?.bedrooms || 5} quartos</p>
                <p className="text-sm text-gray-500">{property?.beds || 8} camas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaBath className="w-6 h-6 text-amber-500" />
              <div>
                <p className="font-bold text-gray-800">{property?.bathrooms || 5} banheiros</p>
                <p className="text-sm text-gray-500">Completos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-gray-800 mb-6">
            Sobre a Casa
          </h2>
          <div className="prose prose-lg text-gray-600">
            <p>
              {property?.description ||
                `Bem-vindo à Casa da Pampulha, um refúgio perfeito para famílias e grupos que buscam
                conforto, privacidade e uma localização privilegiada em Belo Horizonte.`}
            </p>
            <p className="mt-4">
              Localizada a poucos metros da Lagoa da Pampulha, nossa casa oferece uma experiência
              única de hospedagem com piscina e jacuzzi aquecidas, amplo playground para crianças,
              área gourmet completa e muito mais.
            </p>
            <p className="mt-4">
              A região é famosa por seus pontos turísticos projetados por Oscar Niemeyer, como a
              Igrejinha da Pampulha, o Museu de Arte e a Casa do Baile, todos a poucos minutos de carro.
            </p>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-gray-800 text-center mb-12">
            Destaques
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {highlights.map((item, index) => (
              <div key={index} className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl">
                <item.icon className="w-10 h-10 mx-auto text-amber-500 mb-3" />
                <h3 className="font-bold text-gray-800">{item.label}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-gray-800 text-center mb-6">
            Localização Privilegiada
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">
            A apenas 250 metros da Lagoa da Pampulha, você terá fácil acesso a toda a orla
            para caminhadas, passeios de bicicleta e contemplação do pôr do sol.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Distâncias</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex justify-between">
                  <span>Lagoa da Pampulha</span>
                  <span className="font-medium">250m</span>
                </li>
                <li className="flex justify-between">
                  <span>Igrejinha da Pampulha</span>
                  <span className="font-medium">6.4 km</span>
                </li>
                <li className="flex justify-between">
                  <span>Estádio Mineirão</span>
                  <span className="font-medium">7.1 km</span>
                </li>
                <li className="flex justify-between">
                  <span>Aeroporto de Confins</span>
                  <span className="font-medium">35 km</span>
                </li>
                <li className="flex justify-between">
                  <span>Centro de BH</span>
                  <span className="font-medium">12 km</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Atrações Próximas</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center space-x-2">
                  <FaStar className="text-amber-500" />
                  <span>Conjunto Arquitetônico da Pampulha (UNESCO)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <FaStar className="text-amber-500" />
                  <span>Jardim Zoológico de BH</span>
                </li>
                <li className="flex items-center space-x-2">
                  <FaStar className="text-amber-500" />
                  <span>Parque Ecológico da Pampulha</span>
                </li>
                <li className="flex items-center space-x-2">
                  <FaStar className="text-amber-500" />
                  <span>Museu Casa Kubitschek</span>
                </li>
                <li className="flex items-center space-x-2">
                  <FaStar className="text-amber-500" />
                  <span>Restaurantes renomados</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-amber-500 to-orange-500 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            Reserve sua Estadia
          </h2>
          <p className="text-white/90 mb-8">
            Mínimo de {property?.minNights || 2} noites • Check-in: {property?.checkInTime || '15:00'} • Check-out: {property?.checkOutTime || '11:00'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={property?.airbnbUrl || 'https://www.airbnb.com.br'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-white text-amber-600 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors"
            >
              <span>Reserve no Airbnb</span>
            </a>
            <Link
              href="/galeria"
              className="inline-flex items-center space-x-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-colors"
            >
              <span>Ver Galeria de Fotos</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
