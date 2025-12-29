'use client';

import { useEffect, useState } from 'react';
import {
  FaWifi, FaParking, FaTv, FaSnowflake, FaSwimmingPool, FaHotTub,
  FaUtensils, FaTree, FaChild, FaDumbbell, FaShieldAlt, FaConciergeBell
} from 'react-icons/fa';

interface Amenity {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  order: number;
}

const iconMap: Record<string, any> = {
  wifi: FaWifi,
  car: FaParking,
  parking: FaParking,
  tv: FaTv,
  snowflake: FaSnowflake,
  pool: FaSwimmingPool,
  'hot-tub': FaHotTub,
  grill: FaUtensils,
  playground: FaChild,
  washer: FaConciergeBell,
  hairdryer: FaConciergeBell,
  default: FaConciergeBell,
};

export default function ComodidadesPage() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = async () => {
    try {
      const response = await fetch('/api/amenities');
      const data = await response.json();
      setAmenities(data);
    } catch (error) {
      console.error('Erro ao carregar comodidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Todas', ...Array.from(new Set(amenities.map(a => a.category)))];

  const filteredAmenities = selectedCategory === 'Todas'
    ? amenities
    : amenities.filter(a => a.category === selectedCategory);

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || iconMap.default;
    return <IconComponent className="w-8 h-8" />;
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-500 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Comodidades
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Tudo o que você precisa para uma estadia perfeita
          </p>
        </div>
      </section>

      {/* Categories - Horizontal Scroll */}
      {categories.length > 2 && (
        <section className="py-6 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:-mx-0 sm:px-0"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    selectedCategory === category
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
              {/* Elemento para garantir visualização parcial do último */}
              <div className="w-4 flex-shrink-0" aria-hidden="true" />
            </div>
          </div>
          {/* CSS para esconder scrollbar */}
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </section>
      )}

      {/* Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
          ) : filteredAmenities.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredAmenities.map((amenity) => (
                <div
                  key={amenity._id}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4 text-teal-600">
                    {getIcon(amenity.icon)}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {amenity.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {amenity.description}
                  </p>
                  <span className="inline-block mt-3 text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded">
                    {amenity.category}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500">Nenhuma comodidade encontrada.</p>
            </div>
          )}
        </div>
      </section>

      {/* Highlights Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-gray-800 text-center mb-12">
            Destaques da Casa
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl">
              <FaSwimmingPool className="w-16 h-16 mx-auto text-amber-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Piscina Aquecida</h3>
              <p className="text-gray-600">
                Piscina com aquecimento solar para você aproveitar em qualquer época do ano.
              </p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl">
              <FaHotTub className="w-16 h-16 mx-auto text-teal-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Jacuzzi Aquecida</h3>
              <p className="text-gray-600">
                Relaxe na jacuzzi com hidromassagem após um dia de passeios.
              </p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
              <FaChild className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Playground Completo</h3>
              <p className="text-gray-600">
                Parquinho exclusivo com brinquedos seguros para as crianças.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
