import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface PageTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  title: string;
  subtitle?: string;
}

export function PageTitle({ title, subtitle, className, ...props }: PageTitleProps) {
  return (
    <div className={cn('mb-8', className)}>
      <h1
        className="text-4xl font-bold tracking-tight shimmer-gradient lg:text-5xl"
        {...props}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 text-lg text-muted-foreground sm:text-xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
