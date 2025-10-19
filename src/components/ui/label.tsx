import * as React from 'react';
import { cn } from '@/src/lib/utils/cn';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn('text-sm font-medium text-slate-700', className)}
    {...props}
  />
));
Label.displayName = 'Label';
