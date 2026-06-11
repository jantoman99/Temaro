"use client";

import type { CSSProperties, ReactNode } from "react";

import { useInView } from "@/hooks/use-in-view";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export function Reveal({ children, delay = 0, className }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const reduce = usePrefersReducedMotion();
  const active = reduce || inView;

  const style: CSSProperties = {
    opacity: 1,
    transform: active ? "none" : "translateY(14px)",
    transitionProperty: reduce ? "none" : "transform",
    transitionDuration: reduce ? "0ms" : "620ms",
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
    transitionDelay: active && !reduce ? `${delay}ms` : "0ms",
    willChange: active && !reduce ? "transform" : "auto",
  };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
