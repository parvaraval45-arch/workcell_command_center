'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton-pulse rounded-[4px]', className)}
      style={style}
    />
  );
}

/** Full-width card skeleton matching the card layout */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('card p-5', className)}>
      <Skeleton className="h-3 w-32 mb-4" />
      <Skeleton className="h-8 w-24 mb-3" />
      <Skeleton className="h-2 w-full mb-2" />
      <Skeleton className="h-2 w-3/4 mb-2" />
      <Skeleton className="h-2 w-1/2" />
    </div>
  );
}

/** Health strip skeleton */
export function HealthStripSkeleton() {
  return (
    <div className="card overflow-hidden" style={{ minHeight: 110 }}>
      <div className="flex items-center gap-6 px-6 py-5">
        <div className="flex items-center gap-3">
          <Skeleton className="w-3 h-3 rounded-full" />
          <Skeleton className="h-6 w-28" />
        </div>
        <Skeleton className="h-12 w-px" />
        <div className="flex-1">
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-4 w-40 mb-2" />
          <Skeleton className="h-[6px] w-full rounded-full" />
        </div>
        <Skeleton className="h-12 w-px" />
        <div className="flex gap-6">
          <div>
            <Skeleton className="h-3 w-12 mb-1" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div>
            <Skeleton className="h-3 w-12 mb-1" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div>
            <Skeleton className="h-3 w-12 mb-1" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Section skeleton with multiple card placeholders */
export function SectionSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-4 w-40" />
        <div className="flex-1 h-px" style={{ background: 'var(--border-primary)' }} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: cards }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
