'use client';

import * as HeroIcons from '@heroicons/react/24/outline';
import * as FA from 'react-icons/fa';
import * as FA6 from 'react-icons/fa6';
import { ComponentType } from 'react';

interface DynamicIconProps {
  name: string;
  className?: string;
}

export function DynamicIcon({ name, className = 'h-6 w-6' }: DynamicIconProps) {
  const Icon = getIconComponent(name);
  if (!Icon) {
    return <HeroIcons.QuestionMarkCircleIcon className={className} />;
  }
  return <Icon className={className} />;
}

export function getIconComponent(iconName: string): ComponentType<{ className?: string }> | null {
  if (!iconName) return null;

  // Check HeroIcons first (most common)
  const heroKey = iconName as keyof typeof HeroIcons;
  if (HeroIcons[heroKey]) {
    return HeroIcons[heroKey] as ComponentType<{ className?: string }>;
  }

  // Check FontAwesome
  const faKey = iconName as keyof typeof FA;
  if (FA[faKey]) {
    return FA[faKey] as ComponentType<{ className?: string }>;
  }

  // Check FontAwesome 6
  const fa6Key = iconName as keyof typeof FA6;
  if (FA6[fa6Key]) {
    return FA6[fa6Key] as ComponentType<{ className?: string }>;
  }

  // Fallback to check by lowercase name
  const lowerName = iconName.toLowerCase();

  // Check HeroIcons with lowercase match
  for (const [key, value] of Object.entries(HeroIcons)) {
    if (key.toLowerCase() === lowerName || key.toLowerCase().includes(lowerName)) {
      return value as ComponentType<{ className?: string }>;
    }
  }

  // Check FA with lowercase match
  for (const [key, value] of Object.entries(FA)) {
    if (key.toLowerCase() === lowerName || key.toLowerCase() === `fa${lowerName}`) {
      return value as ComponentType<{ className?: string }>;
    }
  }

  return null;
}
