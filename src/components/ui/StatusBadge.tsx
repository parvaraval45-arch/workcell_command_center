'use client';

import type { StatusType } from '@/lib/tokens';
import { getStatusColor, getStatusBgColor, getStatusDotClass, cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  showDot?: boolean;
}

export default function StatusBadge({ status, label, showDot = true }: StatusBadgeProps) {
  const color = getStatusColor(status);
  const bgColor = getStatusBgColor(status);
  const dotClass = getStatusDotClass(status);

  return (
    <div
      className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[4px] text-[11px] font-medium capitalize"
      style={{ background: bgColor, color }}
    >
      {showDot && (
        <div
          className={cn('w-[8px] h-[8px] rounded-full', dotClass)}
          style={{ background: color }}
        />
      )}
      {label ?? status}
    </div>
  );
}
