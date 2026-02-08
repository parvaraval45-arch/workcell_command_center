'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Detect reduced motion preference
function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}

// Stagger container for page load
const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

const staggerContainerReduced = {
  hidden: {},
  visible: {},
};

// Individual card item
const fadeUpItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
};

const noMotionItem = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};

/** Wraps page content with staggered fade-up animations */
export function StaggerContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      variants={reduced ? staggerContainerReduced : staggerContainer}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Individual animated item within a StaggerContainer */
export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div variants={reduced ? noMotionItem : fadeUpItem} className={className}>
      {children}
    </motion.div>
  );
}

/** Sidebar slide-in from left */
export function SidebarMotion({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : { x: -64, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Top bar slide down */
export function TopBarMotion({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : { y: -52, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2, ease: [0, 0, 0.2, 1], delay: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Red vignette for stopped state */
export function StoppedVignette({ visible }: { visible: boolean }) {
  const reduced = usePrefersReducedMotion();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduced ? { opacity: 0.2 } : { opacity: 0 }}
          animate={{ opacity: 0.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 pointer-events-none z-[6]"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(220, 38, 38, 0.06) 100%)',
          }}
        />
      )}
    </AnimatePresence>
  );
}

/** Smooth height expand/collapse for alert details */
export function ExpandableSection({
  expanded,
  children,
}: {
  expanded: boolean;
  children: React.ReactNode;
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {expanded && (
        <motion.div
          initial={reduced ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={reduced ? { height: 0, opacity: 0 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          style={{ overflow: 'hidden' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
