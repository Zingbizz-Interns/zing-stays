import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-skeleton-wave rounded-md bg-muted', className)}
      {...props}
    />
  );
}

export default Skeleton;
