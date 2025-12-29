'use client';

import { useState } from 'react';
import Image from 'next/image';
import { StarIcon, MapPinIcon, ClockIcon, MapIcon } from '@heroicons/react/24/solid';
import { IPlace, Category, placeCategories } from '@/types';
import {
  LandmarkIcon,
  UtensilsCrossed,
  Beer,
  ShoppingCart,
  Dumbbell,
  Baby
} from 'lucide-react';

interface PlaceCardProps {
  places: IPlace[];
}

const categoryIcons: Record<string, React.ElementType> = {
  all: LandmarkIcon,
  attractions: LandmarkIcon,
  restaurants: UtensilsCrossed,
  bars: Beer,
  services: ShoppingCart,
  sports: Dumbbell,
  kids: Baby,
};

export default function PlaceCard({ places }: PlaceCardProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [minRating, setMinRating] = useState(0);
  const [maxDistance, setMaxDistance] = useState<number | null>(null);

  const filteredPlaces = places.filter(place => {
    // Category filter
    if (selectedCategory !== 'all' && place.category !== selectedCategory) {
      return false;
    }

    // Rating filter
    if (place.rating < minRating) {
      return false;
    }

    // Distance filter
    if (maxDistance && place.distance) {
      const distMatch = place.distance.match(/[\d.]+/);
      if (distMatch) {
        const dist = parseFloat(distMatch[0]);
        const isKm = place.distance.includes('km');
        const distInKm = isKm ? dist : dist / 1000;
        if (distInKm > maxDistance) {
          return false;
        }
      }
    }

    return true;
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-amber-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Filters - Horizontal Scroll on Mobile */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-8">
        <div className="space-y-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <div
              className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:-mx-0 sm:px-0"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {placeCategories.map((cat) => {
                const Icon = categoryIcons[cat.id];
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as Category)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                      selectedCategory === cat.id
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
              <div className="w-4 flex-shrink-0" aria-hidden="true" />
            </div>
          </div>

          {/* Rating and Distance Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classificação Mínima
              </label>
              <div
                className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {[0, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(rating)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                      minRating === rating
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {rating === 0 ? 'Todos' : (
                      <>
                        <span>{rating}+</span>
                        <StarIcon className="h-4 w-4" />
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distância Máxima
              </label>
              <div
                className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {[null, 2, 5, 10].map((distance) => (
                  <button
                    key={distance ?? 'all'}
                    onClick={() => setMaxDistance(distance)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                      maxDistance === distance
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {distance === null ? 'Todos' : `${distance} km`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS para esconder scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Results Count */}
      <p className="text-gray-600 mb-4">
        {filteredPlaces.length} {filteredPlaces.length === 1 ? 'local encontrado' : 'locais encontrados'}
      </p>

      {/* Places Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlaces.map((place) => {
          const CategoryIcon = categoryIcons[place.category];
          return (
            <div key={place._id} className="card overflow-hidden">
              {/* Image */}
              <div className="relative h-48">
                <Image
                  src={place.image}
                  alt={place.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700">
                    <CategoryIcon className="h-3 w-3 mr-1" />
                    {placeCategories.find(c => c.id === place.category)?.label}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {place.name}
                  </h3>
                  {renderStars(place.rating)}
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {place.description}
                </p>

                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="h-4 w-4 text-amber-500" />
                    <span className="truncate">{place.address}</span>
                  </div>

                  {place.distance && (
                    <div className="flex items-center space-x-2">
                      <MapIcon className="h-4 w-4 text-amber-500" />
                      <span>{place.distance}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-4">
                    {place.distanceWalk && (
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-4 w-4 text-green-500" />
                        <span>🚶 {place.distanceWalk}</span>
                      </div>
                    )}
                    {place.distanceCar && (
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-4 w-4 text-blue-500" />
                        <span>🚗 {place.distanceCar}</span>
                      </div>
                    )}
                  </div>
                </div>

                {place.mapUrl && (
                  <a
                    href={place.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 mt-4 text-amber-600 hover:text-amber-700 text-sm font-medium"
                  >
                    <MapPinIcon className="h-4 w-4" />
                    <span>Ver no Mapa</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredPlaces.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Nenhum local encontrado com os filtros selecionados.
          </p>
        </div>
      )}
    </div>
  );
}
