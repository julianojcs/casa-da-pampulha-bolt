'use client';

import { useEffect, useState } from 'react';
import {
  FaHome, FaKey, FaClock, FaWifi, FaParking, FaSwimmingPool,
  FaUtensils, FaShieldAlt, FaPhone, FaMapMarkerAlt, FaInfoCircle
} from 'react-icons/fa';

interface WelcomeGuide {
  _id: string;
  title: string;
  sections: {
    title: string;
    icon: string;
    content: string;
    items?: string[];
  }[];
}

interface Property {
  _id: string;
  name: string;
  welcomeMessage: string;
  address: string;
  city: string;
  state: string;
  checkInTime: string;
  checkOutTime: string;
}

const iconMap: Record<string, any> = {
  home: FaHome,
  key: FaKey,
  clock: FaClock,
  wifi: FaWifi,
  parking: FaParking,
  pool: FaSwimmingPool,
  grill: FaUtensils,
  shield: FaShieldAlt,
  phone: FaPhone,
  map: FaMapMarkerAlt,
  info: FaInfoCircle,
  default: FaInfoCircle,
};

export default function BoasVindasPage() {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperty();
  }, []);

  const fetchProperty = async () => {
    try {
      const response = await fetch('/api/property');
      const data = await response.json();
      if (data && data.length > 0) {
        setProperty(data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar propriedade:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || iconMap.default;
    return <IconComponent className="w-6 h-6" />;
  };

  const welcomeSections = [
    {
      title: 'Chegada e Check-in',
      icon: 'key',
      color: 'amber',
      content: 'Seu conforto começa assim que você chega! Siga estas instruções para um check-in tranquilo.',
      items: [
        'Check-in a partir das 15h',
        'Acesse a página de Check-in para instruções detalhadas',
        'Código do cofre enviado por mensagem no dia',
        'Estacionamento para 5 veículos no portão principal',
      ],
    },
    {
      title: 'Wi-Fi e Conectividade',
      icon: 'wifi',
      color: 'blue',
      content: 'Fique sempre conectado durante sua estadia.',
      items: [
        'Rede de alta velocidade em toda a casa',
        'Senha disponível na página de Check-in (área restrita)',
        'Smart TVs com Netflix e YouTube',
        'Tomadas USB disponíveis nos quartos',
      ],
    },
    {
      title: 'Piscina e Jacuzzi',
      icon: 'pool',
      color: 'teal',
      content: 'Aproveite nossa piscina e jacuzzi aquecidas!',
      items: [
        'Aquecimento solar - melhor temperatura durante o dia',
        'Mantenha a capa térmica à noite para conservar o calor',
        'Toalhas de piscina disponíveis',
        'Ducha externa para uso antes de entrar na piscina',
      ],
    },
    {
      title: 'Área Gourmet',
      icon: 'grill',
      color: 'orange',
      content: 'Preparamos uma área completa para você.',
      items: [
        'Churrasqueira a carvão pronta para uso',
        'Cozinha externa equipada',
        'Mesa para até 12 pessoas',
        'Geladeira de bebidas e chopeira disponíveis',
      ],
    },
    {
      title: 'Regras da Casa',
      icon: 'shield',
      color: 'red',
      content: 'Para garantir uma estadia agradável para todos.',
      items: [
        'Não é permitido fumar nas áreas internas',
        'Horário de silêncio: 22h às 8h',
        'Não são permitidas festas ou eventos',
        'Pets não são permitidos',
      ],
    },
    {
      title: 'Contato e Emergências',
      icon: 'phone',
      color: 'green',
      content: 'Estamos sempre disponíveis para ajudar.',
      items: [
        'WhatsApp do anfitrião: disponível 24h',
        'Emergência: 190 (Polícia) / 193 (Bombeiros)',
        'Hospital mais próximo: a 10 min de carro',
        'Farmácia 24h: Drogaria Araújo (15 min)',
      ],
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; light: string }> = {
    amber: { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50' },
    blue: { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50' },
    teal: { bg: 'bg-teal-500', text: 'text-teal-600', light: 'bg-teal-50' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50' },
    red: { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-50' },
    green: { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-50' },
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
            Bem-vindo à Casa da Pampulha! 🏡
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
            {property?.welcomeMessage ||
              'Estamos muito felizes em recebê-lo! Nossa casa foi preparada com carinho para oferecer a você e sua família uma experiência inesquecível.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-lg">Check-in: <strong>{property?.checkInTime || '15:00'}</strong></span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-lg">Check-out: <strong>{property?.checkOutTime || '11:00'}</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Sections */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {welcomeSections.map((section, index) => {
              const colors = colorClasses[section.color];
              return (
                <div
                  key={index}
                  className={`${colors.light} rounded-2xl p-6 border-2 border-transparent hover:border-${section.color}-200 transition-colors`}
                >
                  <div className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center mb-4 text-white`}>
                    {getIcon(section.icon)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {section.content}
                  </p>
                  {section.items && (
                    <ul className="space-y-2">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start space-x-2 text-sm text-gray-700">
                          <span className={colors.text}>•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-display font-bold text-gray-800 mb-8">
            Links Úteis
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/checkin" className="p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
              <FaKey className="w-8 h-8 mx-auto text-amber-600 mb-2" />
              <span className="font-medium text-gray-800">Check-in</span>
            </a>
            <a href="/guia-local" className="p-4 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors">
              <FaMapMarkerAlt className="w-8 h-8 mx-auto text-teal-600 mb-2" />
              <span className="font-medium text-gray-800">Guia Local</span>
            </a>
            <a href="/galeria" className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
              <FaHome className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <span className="font-medium text-gray-800">Galeria</span>
            </a>
            <a href="/faq" className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              <FaInfoCircle className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <span className="font-medium text-gray-800">FAQ</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer Message */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-display font-bold mb-4">
            Aproveite cada momento! ✨
          </h2>
          <p className="text-gray-300 mb-6">
            Se precisar de qualquer coisa, não hesite em nos contatar.
            Estamos aqui para tornar sua estadia inesquecível!
          </p>
          <a
            href="https://wa.me/5531999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-full font-medium hover:bg-green-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>Fale com o Anfitrião</span>
          </a>
        </div>
      </section>
    </div>
  );
}
