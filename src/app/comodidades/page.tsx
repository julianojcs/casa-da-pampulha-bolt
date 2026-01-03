'use client';

import { useEffect, useState } from 'react';
import * as FaIcons from 'react-icons/fa';
import * as Fa6Icons from 'react-icons/fa6';
import * as HeroIcons from '@heroicons/react/24/outline';
import {
  FaWifi, FaParking, FaTv, FaSnowflake, FaSwimmingPool, FaHotTub,
  FaUtensils, FaChild, FaConciergeBell
} from 'react-icons/fa';

interface Amenity {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  order: number;
  isHighlight?: boolean;
  highlightColor?: string;
  highlightDescription?: string;
}

// Map for legacy icon names (lowercase)
const legacyIconMap: Record<string, any> = {
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

  const getIcon = (iconName: string, size: 'sm' | 'lg' = 'sm') => {
    const sizeClass = size === 'lg' ? 'w-16 h-16' : 'w-8 h-8';

    // New format: prefix:icon-name (e.g., hero:wifi, fa:swimming-pool, fa6:bed)
    if (iconName && iconName.includes(':')) {
      const [prefix, name] = iconName.split(':');

      // Convert kebab-case to PascalCase for component lookup
      const pascalName = name
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');

      if (prefix === 'hero') {
        const heroIconName = `${pascalName}Icon`;
        const IconComponent = (HeroIcons as any)[heroIconName];
        if (IconComponent) {
          return <IconComponent className={sizeClass} />;
        }
      } else if (prefix === 'fa') {
        const faIconName = `Fa${pascalName}`;
        const IconComponent = (FaIcons as any)[faIconName];
        if (IconComponent) {
          return <IconComponent className={sizeClass} />;
        }
      } else if (prefix === 'fa6') {
        const fa6IconName = `Fa${pascalName}`;
        const IconComponent = (Fa6Icons as any)[fa6IconName];
        if (IconComponent) {
          return <IconComponent className={sizeClass} />;
        }
      }
    }

    // Legacy format: FaIconName (e.g., FaSwimmingPool)
    if (iconName && iconName.startsWith('Fa')) {
      // Try FA first, then FA6
      const IconComponent = (FaIcons as any)[iconName] || (Fa6Icons as any)[iconName];
      if (IconComponent) {
        return <IconComponent className={sizeClass} />;
      }
    }

    // Fallback to legacy icon map
    const IconComponent = legacyIconMap[iconName] || legacyIconMap.default;
    return <IconComponent className={sizeClass} />;
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
            <div className="space-y-4">
              {filteredAmenities
                .filter(a => !a.isHighlight)
                .map((amenity) => (
                <div
                  key={amenity._id}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 text-teal-600">
                    {getIcon(amenity.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {amenity.name}
                      </h3>
                      <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                        {amenity.category}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-0.5">
                      {amenity.description}
                    </p>
                  </div>
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

      {/* Highlights Section - Dynamic */}
      {amenities.filter(a => a.isHighlight).length > 0 && (
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-bold text-gray-800 text-center mb-12">
              Destaques da Casa
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {amenities
                .filter(a => a.isHighlight)
                .map((highlight) => {
                  const color = highlight.highlightColor || 'blue';
                  const colorClasses: Record<string, { bg: string; text: string }> = {
                    blue: { bg: 'from-blue-50 to-blue-100', text: 'text-blue-500' },
                    green: { bg: 'from-green-50 to-green-100', text: 'text-green-500' },
                    amber: { bg: 'from-amber-50 to-amber-100', text: 'text-amber-500' },
                    purple: { bg: 'from-purple-50 to-purple-100', text: 'text-purple-500' },
                    teal: { bg: 'from-teal-50 to-teal-100', text: 'text-teal-500' },
                    rose: { bg: 'from-rose-50 to-rose-100', text: 'text-rose-500' },
                  };
                  const { bg, text } = colorClasses[color] || colorClasses.blue;

                  return (
                    <div
                      key={highlight._id}
                      className={`text-center p-8 bg-gradient-to-br ${bg} rounded-2xl`}
                    >
                      <div className={`w-16 h-16 mx-auto flex items-center justify-center ${text} mb-4`}>
                        {getIcon(highlight.icon, 'lg')}
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {highlight.name}
                      </h3>
                      <p className="text-gray-600">
                        {highlight.highlightDescription || highlight.description}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
