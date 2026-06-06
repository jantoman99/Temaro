"use client";

import { useEffect, useRef } from "react";

import { useInView } from "@/hooks/use-in-view";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type CountUpProps = {
  to: number;
  durationMs?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
};

function fmt(value: number, decimals: number) {
  return value.toLocaleString("cs-CZ", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function CountUp({
  to,
  durationMs = 1100,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: CountUpProps) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const reduce = usePrefersReducedMotion();
  const done = useRef(false);

  useEffect(() => {
    if (!inView || done.current) return;

    const node = ref.current;
    if (!node) return;

    done.current = true;

    if (reduce || to === 0) {
      node.textContent = `${prefix}${fmt(to, decimals)}${suffix}`;
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = `${prefix}${fmt(to * eased, decimals)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        node.textContent = `${prefix}${fmt(to, decimals)}${suffix}`;
      }
    };

    requestAnimationFrame(tick);
  }, [inView, reduce, to, decimals, durationMs, prefix, suffix, ref]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {fmt(to, decimals)}
      {suffix}
    </span>
  );
}
