'use client';

import { useState } from 'react';
import Image from 'next/image';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, PlayIcon } from '@heroicons/react/24/outline';
import { IGalleryItem } from '@/types';

interface GalleryGridProps {
  items: IGalleryItem[];
  categories: string[];
}

export default function GalleryGrid({ items, categories }: GalleryGridProps) {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedItem, setSelectedItem] = useState<IGalleryItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredItems = selectedCategory === 'Todos'
    ? items
    : items.filter(item => item.category === selectedCategory);

  const openLightbox = (item: IGalleryItem, index: number) => {
    setSelectedItem(item);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedItem(null);
  };

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? filteredItems.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setSelectedItem(filteredItems[newIndex]);
  };

  const goToNext = () => {
    const newIndex = currentIndex === filteredItems.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    setSelectedItem(filteredItems[newIndex]);
  };

  return (
    <div>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`category-btn ${
              selectedCategory === category
                ? 'category-btn-active'
                : 'category-btn-inactive'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item, index) => (
          <div
            key={item._id || index}
            onClick={() => openLightbox(item, index)}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
          >
            <Image
              src={item.thumbnail}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              {item.type === 'video' ? (
                <PlayIcon className="h-12 w-12 text-white" />
              ) : (
                <span className="text-white text-sm font-medium text-center px-2">
                  {item.title}
                </span>
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
              <span className="text-white text-xs">{item.category}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedItem && (
        <div className="gallery-modal" onClick={closeLightbox}>
          <div
            className="relative max-w-5xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 text-white hover:text-amber-500 z-10"
            >
              <XMarkIcon className="h-8 w-8" />
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-amber-500 z-10 bg-black/50 rounded-full p-2"
            >
              <ChevronLeftIcon className="h-8 w-8" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-amber-500 z-10 bg-black/50 rounded-full p-2"
            >
              <ChevronRightIcon className="h-8 w-8" />
            </button>

            {/* Content */}
            {selectedItem.type === 'video' ? (
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={selectedItem.src}
                  title={selectedItem.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="relative">
                <Image
                  src={selectedItem.src}
                  alt={selectedItem.title}
                  width={1200}
                  height={800}
                  className="rounded-lg max-h-[80vh] w-auto mx-auto object-contain"
                />
              </div>
            )}

            {/* Caption */}
            <div className="text-center mt-4">
              <h3 className="text-white text-lg font-medium">{selectedItem.title}</h3>
              <p className="text-gray-400 text-sm">{selectedItem.category}</p>
              <p className="text-gray-500 text-xs mt-2">
                {currentIndex + 1} / {filteredItems.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
