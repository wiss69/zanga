import * as React from 'react';
import { cn } from '@/src/lib/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        variant === 'default'
          ? 'bg-primary/10 text-primary'
          : 'border border-primary text-primary',
        className
      )}
      {...props}
    />
  );
}
