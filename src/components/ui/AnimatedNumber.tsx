'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  duration?: number; // ms, auto-scaled based on change magnitude
  className?: string;
  style?: React.CSSProperties;
  prefix?: string;
  suffix?: string;
}

export default function AnimatedNumber({
  value,
  decimals = 1,
  duration,
  className = '',
  style,
  prefix = '',
  suffix = '',
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const animate = useCallback(
    (from: number, to: number, dur: number) => {
      if (prefersReducedMotion.current || dur === 0) {
        setDisplay(to);
        return;
      }

      cancelAnimationFrame(animFrameRef.current);
      startTimeRef.current = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTimeRef.current;
        const progress = Math.min(elapsed / dur, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = from + (to - from) * eased;
        setDisplay(current);

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(step);
        }
      };

      animFrameRef.current = requestAnimationFrame(step);
    },
    []
  );

  useEffect(() => {
    const from = prevValue.current;
    const to = value;
    prevValue.current = value;

    if (from === to) return;

    // Auto-duration: 300ms for small changes, 500ms for large
    const changeMagnitude = Math.abs(to - from) / Math.max(Math.abs(from), 1);
    const autoDuration = changeMagnitude > 0.1 ? 500 : 300;
    const dur = duration ?? autoDuration;

    animate(from, to, dur);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [value, duration, animate]);

  return (
    <span className={`font-metric ${className}`} style={style}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
