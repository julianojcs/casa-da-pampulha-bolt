'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface FilterOption {
  value: string;
  label: string;
}

interface ScrollableFilterProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  allLabel?: string;
  className?: string;
}

export function ScrollableFilter({
  options,
  value,
  onChange,
  allLabel = 'Todos',
  className = '',
}: ScrollableFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    const container = scrollRef.current;
    if (!container) return;

    setShowLeftArrow(container.scrollLeft > 0);
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    );
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [options]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollAmount = 150;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const allOptions: FilterOption[] = [{ value: '', label: allLabel }, ...options];

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          type="button"
          onClick={() => scroll('left')}
          className="absolute left-0 z-10 h-full px-1 bg-gradient-to-r from-white via-white to-transparent flex items-center"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-500 hover:text-amber-600" />
        </button>
      )}

      {/* Filter Buttons */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-6"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {allOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              value === option.value
                ? 'bg-amber-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          type="button"
          onClick={() => scroll('right')}
          className="absolute right-0 z-10 h-full px-1 bg-gradient-to-l from-white via-white to-transparent flex items-center"
        >
          <ChevronRightIcon className="h-5 w-5 text-gray-500 hover:text-amber-600" />
        </button>
      )}
    </div>
  );
}
