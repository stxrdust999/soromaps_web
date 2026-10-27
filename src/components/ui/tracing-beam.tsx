"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface TracingBeamProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Feixe de luz lateral que acompanha o scroll da página ao longo da leitura do conteúdo.
 */
export function TracingBeam({ children, className }: TracingBeamProps) {
  const containerReference = useRef<HTMLDivElement | null>(null);
  const contentReference = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerReference,
    offset: ["start start", "end end"],
  });

  const [svgHeight, setSvgHeight] = useState(0);

  useEffect(() => {
    if (!contentReference.current) return;
    setSvgHeight(contentReference.current.offsetHeight);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSvgHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(contentReference.current);

    return () => resizeObserver.disconnect();
  }, []);

  const y1 = useSpring(
    useTransform(scrollYProgress, [0, 0.8], [50, svgHeight]),
    {
      stiffness: 500,
      damping: 90,
    },
  );

  const y2 = useSpring(
    useTransform(scrollYProgress, [0, 1], [50, svgHeight - 50]),
    {
      stiffness: 500,
      damping: 90,
    },
  );

  return (
    <motion.div
      ref={containerReference}
      className={cn("relative mx-auto w-full max-w-4xl", className)}
    >
      <div className="absolute -left-4 top-3 md:-left-12">
        <motion.div
          transition={{
            duration: 0.2,
            delay: 0.5,
          }}
          className="ml-[27px] flex size-4 items-center justify-center rounded-full border border-neutral-200 shadow-xs dark:border-neutral-700"
        >
          <motion.div
            transition={{
              duration: 0.2,
              delay: 0.5,
            }}
            className="size-2 rounded-full border border-primary bg-primary text-primary-foreground"
          />
        </motion.div>
        <svg
          viewBox={`0 0 20 ${svgHeight}`}
          width="20"
          height={svgHeight}
          className="ml-4 block"
          aria-hidden="true"
        >
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="#9091A0"
            strokeOpacity="0.16"
            transition={{
              duration: 10,
            }}
          />
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="url(#gradient-tracing-beam)"
            strokeWidth="2.5"
            className="motion-reduce:hidden"
            transition={{
              duration: 10,
            }}
          />
          <defs>
            <motion.linearGradient
              id="gradient-tracing-beam"
              gradientUnits="userSpaceOnUse"
              x1="0"
              x2="0"
              y1={y1}
              y2={y2}
            >
              <stop stopColor="#3b82f6" stopOpacity="0" />
              <stop stopColor="#3b82f6" />
              <stop offset="0.325" stopColor="#8b5cf6" />
              <stop offset="1" stopColor="#ec4899" stopOpacity="0" />
            </motion.linearGradient>
          </defs>
        </svg>
      </div>
      <div ref={contentReference}>{children}</div>
    </motion.div>
  );
}
