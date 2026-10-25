"use client";

import { motion, useAnimation } from "motion/react";
import React, { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  maxOpacity: number;
  opacitySpeed: number;
}

interface SparklesCoreProps {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  particleColor?: string;
}

/**
 * Renderiza uma camada interativa de partículas cintilantes em canvas acelerado por hardware.
 */
export function SparklesCore({
  id,
  className,
  background = "transparent",
  minSize = 0.6,
  maxSize = 2.4,
  particleDensity = 100,
  particleColor = "#ffffff",
}: SparklesCoreProps) {
  const generatedId = useId();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const controls = useAnimation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth ?? 300);
    let height = (canvas.height = canvas.parentElement?.clientHeight ?? 150);

    const particles: Particle[] = [];
    const count = Math.floor((width * height) / (10000 / particleDensity));

    for (let index = 0; index < count; index++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * (maxSize - minSize) + minSize,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        opacity: Math.random(),
        maxOpacity: Math.random() * 0.8 + 0.2,
        opacitySpeed: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
      });
    }

    const render = () => {
      context.clearRect(0, 0, width, height);

      for (const particle of particles) {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.opacity += particle.opacitySpeed;

        if (particle.opacity > particle.maxOpacity || particle.opacity < 0.1) {
          particle.opacitySpeed = -particle.opacitySpeed;
        }

        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;

        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fillStyle = particleColor;
        context.globalAlpha = Math.max(0, Math.min(1, particle.opacity));
        context.fill();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
    setIsReady(true);
    controls.start({
      opacity: 1,
      transition: { duration: 0.6 },
    });

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [maxSize, minSize, particleColor, particleDensity, controls]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={controls}
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ background }}
    >
      <canvas
        id={id || generatedId}
        ref={canvasRef}
        className={cn("size-full", isReady ? "opacity-100" : "opacity-0")}
      />
    </motion.div>
  );
}

interface SparklesProps {
  children?: React.ReactNode;
  className?: string;
  sparkleColor?: string;
  density?: number;
}

/**
 * Envolve botões ou containers com fagulhas e feixes cintilantes dinâmicos.
 */
export function Sparkles({
  children,
  className,
  sparkleColor = "#38bdf8",
  density = 50,
}: SparklesProps) {
  return (
    <div className={cn("relative inline-flex items-center justify-center overflow-hidden", className)}>
      <SparklesCore
        particleColor={sparkleColor}
        particleDensity={density}
        minSize={0.8}
        maxSize={2}
      />
      {children}
    </div>
  );
}
