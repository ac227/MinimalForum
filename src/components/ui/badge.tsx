import * as React from 'react';

import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'outline';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-zinc-900 text-zinc-50',
  secondary: 'border-zinc-300 bg-zinc-100 text-zinc-700',
  outline: 'border-zinc-300 text-zinc-700',
};

function Badge({
  className,
  variant = 'secondary',
  ...props
}: React.ComponentProps<'span'> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
