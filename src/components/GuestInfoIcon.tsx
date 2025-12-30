'use client';

import { DynamicIcon } from './IconPicker';

interface GuestInfoIconProps {
  iconName: string;
  className?: string;
}

export function GuestInfoIcon({ iconName, className = 'h-6 w-6' }: GuestInfoIconProps) {
  return <DynamicIcon name={iconName} className={className} />;
}
