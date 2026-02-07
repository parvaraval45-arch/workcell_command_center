'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SystemStatus } from '@/lib/types';

/** Animated status dot that scales on change */
export function AnimatedStatusDot({
  status,
  dotClass,
  color,
}: {
  status: SystemStatus;
  dotClass: string;
  color: string;
}) {
  const [pulse, setPulse] = useState(false);
  const prevStatus = useRef(status);

  useEffect(() => {
    if (status !== prevStatus.current) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 300);
      prevStatus.current = status;
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <motion.div
      className={`w-3 h-3 rounded-full ${dotClass}`}
      style={{ background: color }}
      animate={pulse ? { scale: [1, 1.4, 1] } : { scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      aria-hidden="true"
    />
  );
}

/** Status text that crossfades on change */
export function AnimatedStatusText({
  text,
  color,
  className = '',
}: {
  text: string;
  color: string;
  className?: string;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={text}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2 }}
        className={className}
        style={{ color }}
      >
        {text}
      </motion.span>
    </AnimatePresence>
  );
}

/** Status icon that accompanies the text (accessibility: not color-only) */
export function StatusIcon({ status }: { status: SystemStatus }) {
  const icons: Record<SystemStatus, string> = {
    operational: '✓',
    degraded: '⚠',
    stopped: '✗',
  };

  return (
    <span
      className="text-[10px] font-bold"
      role="img"
      aria-label={status}
    >
      {icons[status]}
    </span>
  );
}
