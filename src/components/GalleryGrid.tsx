'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, PlayIcon } from '@heroicons/react/24/outline';
import { IGalleryItem } from '@/types';
import { getLightboxUrl, getYouTubeThumbnail } from '@/lib/cloudinary';

interface GalleryGridProps {
  items: IGalleryItem[];
  categories: string[];
}

// Número de itens a carregar por vez
const ITEMS_PER_PAGE = 12;

export default function GalleryGrid({ items, categories }: GalleryGridProps) {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedItem, setSelectedItem] = useState<IGalleryItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const filterScrollRef = useRef<HTMLDivElement>(null);

  const filteredItems = selectedCategory === 'Todos'
    ? items
    : items.filter(item => item.category === selectedCategory);

  // Items visíveis com lazy loading
  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  // Reset visible count quando categoria muda
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [selectedCategory]);

  // Intersection Observer para lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setIsLoadingMore(true);
          // Simular pequeno delay para UX
          setTimeout(() => {
            setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredItems.length));
            setIsLoadingMore(false);
          }, 300);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, filteredItems.length]);

  // Preload adjacent images for smooth navigation
  const preloadAdjacentImages = useCallback((index: number) => {
    const imagesToPreload: string[] = [];

    const prevIndex = index === 0 ? filteredItems.length - 1 : index - 1;
    const nextIndex = index === filteredItems.length - 1 ? 0 : index + 1;

    [prevIndex, index, nextIndex].forEach((idx) => {
      const item = filteredItems[idx];
      if (item && item.type !== 'video' && !preloadedImages.has(item.src)) {
        imagesToPreload.push(item.src);
      }
    });

    imagesToPreload.forEach((src) => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        setPreloadedImages((prev) => new Set(prev).add(src));
      };
    });
  }, [filteredItems, preloadedImages]);

  useEffect(() => {
    if (selectedItem) {
      preloadAdjacentImages(currentIndex);
    }
  }, [selectedItem, currentIndex, preloadAdjacentImages]);

  const openLightbox = (item: IGalleryItem, index: number) => {
    setSelectedItem(item);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedItem(null);
  };

  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? filteredItems.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setSelectedItem(filteredItems[newIndex]);
  }, [currentIndex, filteredItems]);

  const goToNext = useCallback(() => {
    const newIndex = currentIndex === filteredItems.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    setSelectedItem(filteredItems[newIndex]);
  }, [currentIndex, filteredItems]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedItem) return;

      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          closeLightbox();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, goToPrevious, goToNext]);

  // Get adjacent items for preloading in the DOM
  const getAdjacentItems = () => {
    if (!selectedItem || filteredItems.length <= 1) return { prev: null, next: null };

    const prevIndex = currentIndex === 0 ? filteredItems.length - 1 : currentIndex - 1;
    const nextIndex = currentIndex === filteredItems.length - 1 ? 0 : currentIndex + 1;

    return {
      prev: filteredItems[prevIndex],
      next: filteredItems[nextIndex],
    };
  };

  const adjacentItems = getAdjacentItems();

  return (
    <div>
      {/* Category Filter - Horizontal Scroll */}
      <div className="relative mb-8">
        {/* Left gradient for desktop */}
        <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10 hidden sm:block opacity-0" id="filter-left-gradient" />
        <div
          ref={filterScrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
          onScroll={(e) => {
            const el = e.currentTarget;
            const leftGradient = document.getElementById('filter-left-gradient');
            const rightGradient = document.getElementById('filter-right-gradient');
            if (leftGradient) {
              leftGradient.style.opacity = el.scrollLeft > 10 ? '1' : '0';
            }
            if (rightGradient) {
              rightGradient.style.opacity = el.scrollLeft < el.scrollWidth - el.clientWidth - 10 ? '1' : '0';
            }
          }}
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`category-btn whitespace-nowrap flex-shrink-0 ${
                selectedCategory === category
                  ? 'category-btn-active'
                  : 'category-btn-inactive'
              }`}
            >
              {category}
            </button>
          ))}
          {/* Elemento invisível para padding final */}
          <div className="w-1 flex-shrink-0" aria-hidden="true" />
        </div>
        {/* Right gradient para indicar scroll */}
        <div id="filter-right-gradient" className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 transition-opacity" />
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {visibleItems.map((item, index) => {
          // Para vídeos, tentar obter thumbnail do YouTube
          const thumbnailSrc = item.type === 'video'
            ? (getYouTubeThumbnail(item.src) || item.thumbnail)
            : item.thumbnail;

          return (
          <div
            key={item._id || index}
            onClick={() => openLightbox(item, index)}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
          >
            <Image
              src={thumbnailSrc}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAQMEAQUAAAAAAAAAAAAAAgEDBAAFESEGEjFBUWH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AqdRsN6h3WU1HuDYpbSETpcxyoqL7+7pSlB//2Q=="
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
            {/* Play icon overlay for videos (always visible) */}
            {item.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/50 rounded-full p-3 group-hover:scale-110 transition-transform">
                  <PlayIcon className="h-8 w-8 text-white" />
                </div>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
              <span className="text-white text-xs">{item.category}</span>
            </div>
          </div>
          );
        })}
      </div>

      {/* Load More Trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {isLoadingMore ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
          ) : (
            <span className="text-gray-400 text-sm">
              Carregando mais...
            </span>
          )}
        </div>
      )}

      {/* Items count */}
      <div className="text-center mt-4 text-gray-500 text-sm">
        Mostrando {visibleItems.length} de {filteredItems.length} itens
      </div>

      {/* Lightbox */}
      {selectedItem && (
        <div className="gallery-modal" onClick={closeLightbox}>
          <div
            className={`relative mx-4 ${selectedItem.type === 'video' ? 'w-[90vw] md:w-[80vw] max-w-6xl' : 'max-w-5xl max-h-[90vh]'}`}
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
              <div className="relative flex items-center justify-center">
                <Image
                  src={getLightboxUrl(selectedItem.src, 1200, 800)}
                  alt={selectedItem.title}
                  width={1200}
                  height={800}
                  className="rounded-lg max-h-[80vh] w-auto mx-auto object-contain"
                  priority
                  unoptimized
                />
              </div>
            )}

            {/* Preload adjacent images (hidden) - usando URLs otimizadas */}
            <div className="hidden">
              {adjacentItems.prev && adjacentItems.prev.type !== 'video' && (
                <Image
                  src={getLightboxUrl(adjacentItems.prev.src, 1200, 800)}
                  alt="preload-prev"
                  width={1200}
                  height={800}
                  priority
                  unoptimized
                />
              )}
              {adjacentItems.next && adjacentItems.next.type !== 'video' && (
                <Image
                  src={getLightboxUrl(adjacentItems.next.src, 1200, 800)}
                  alt="preload-next"
                  width={1200}
                  height={800}
                  priority
                  unoptimized
                />
              )}
            </div>

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

      {/* CSS para esconder scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
