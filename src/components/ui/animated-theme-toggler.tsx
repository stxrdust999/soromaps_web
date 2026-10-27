"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { type ComponentPropsWithoutRef, useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { cn } from "@/lib/utils";

export type TransitionVariant =
  | "circle"
  | "square"
  | "triangle"
  | "diamond"
  | "hexagon"
  | "rectangle"
  | "star";

export interface ThemeViewTransitionOptions {
  duration?: number;
  variant?: TransitionVariant;
  fromCenter?: boolean;
}

interface AnimatedThemeTogglerProps extends ComponentPropsWithoutRef<"button"> {
  duration?: number;
  variant?: TransitionVariant;
  fromCenter?: boolean;
  theme?: "light" | "dark";
  onThemeChange?: (nextTheme: "light" | "dark") => void;
}

/**
 * Generates an SVG polygon `clip-path` for a regular polygon centered at `(centerX, centerY)`.
 */
function regularPolygonPoints(
  centerX: number,
  centerY: number,
  radius: number,
  sides: number,
  rotationRadians = 0,
): string {
  const vertices: string[] = [];
  for (let vertexIndex = 0; vertexIndex < sides; vertexIndex += 1) {
    const angle = rotationRadians + (vertexIndex * 2 * Math.PI) / sides;
    const pointX = centerX + radius * Math.cos(angle);
    const pointY = centerY + radius * Math.sin(angle);
    vertices.push(`${pointX}px ${pointY}px`);
  }
  return `polygon(${vertices.join(", ")})`;
}

/**
 * Generates an SVG polygon `clip-path` for a 5-point star centered at `(centerX, centerY)`.
 */
function starPoints(
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number,
  pointsCount = 5,
  rotationRadians = -Math.PI / 2,
): string {
  const vertices: string[] = [];
  for (let vertexIndex = 0; vertexIndex < pointsCount * 2; vertexIndex += 1) {
    const radius = vertexIndex % 2 === 0 ? outerRadius : innerRadius;
    const angle = rotationRadians + (vertexIndex * Math.PI) / pointsCount;
    const pointX = centerX + radius * Math.cos(angle);
    const pointY = centerY + radius * Math.sin(angle);
    vertices.push(`${pointX}px ${pointY}px`);
  }
  return `polygon(${vertices.join(", ")})`;
}

/**
 * Builds the keyframe `clipPath` sequence for the requested geometric reveal shape.
 */
function getClipPathKeyframes(
  variant: TransitionVariant,
  centerX: number,
  centerY: number,
  maxRadius: number,
  viewportWidth: number,
  viewportHeight: number,
): string[] {
  const originPoint = `${centerX}px ${centerY}px`;

  switch (variant) {
    case "circle":
      return [
        `circle(0px at ${originPoint})`,
        `circle(${maxRadius}px at ${originPoint})`,
      ];

    case "square": {
      const halfSide = maxRadius * Math.SQRT2;
      return [
        `polygon(${originPoint}, ${originPoint}, ${originPoint}, ${originPoint})`,
        `polygon(${centerX - halfSide}px ${centerY - halfSide}px, ${centerX + halfSide}px ${centerY - halfSide}px, ${centerX + halfSide}px ${centerY + halfSide}px, ${centerX - halfSide}px ${centerY + halfSide}px)`,
      ];
    }

    case "rectangle":
      return [
        `polygon(${originPoint}, ${originPoint}, ${originPoint}, ${originPoint})`,
        `polygon(0px 0px, ${viewportWidth}px 0px, ${viewportWidth}px ${viewportHeight}px, 0px ${viewportHeight}px)`,
      ];

    case "diamond": {
      const halfDiagonal = maxRadius * 2;
      return [
        `polygon(${originPoint}, ${originPoint}, ${originPoint}, ${originPoint})`,
        `polygon(${centerX}px ${centerY - halfDiagonal}px, ${centerX + halfDiagonal}px ${centerY}px, ${centerX}px ${centerY + halfDiagonal}px, ${centerX - halfDiagonal}px ${centerY}px)`,
      ];
    }

    case "triangle": {
      const triangleRadius = maxRadius * 2.5;
      return [
        regularPolygonPoints(centerX, centerY, 0, 3, -Math.PI / 2),
        regularPolygonPoints(
          centerX,
          centerY,
          triangleRadius,
          3,
          -Math.PI / 2,
        ),
      ];
    }

    case "hexagon": {
      const hexagonRadius = maxRadius * 1.3;
      return [
        regularPolygonPoints(centerX, centerY, 0, 6, 0),
        regularPolygonPoints(centerX, centerY, hexagonRadius, 6, 0),
      ];
    }

    case "star": {
      const starRadius = maxRadius * 3;
      const stepsCount = 60;
      const totalRotation = (3 * Math.PI) / 4;
      const initialRotation = -Math.PI / 2;

      return Array.from({ length: stepsCount + 1 }, (_, stepIndex) => {
        const progress = stepIndex / stepsCount;
        const easedProgress =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - (-2 * progress + 2) ** 2 / 2;
        const currentRadius = easedProgress * starRadius;
        const currentRotation = initialRotation + easedProgress * totalRotation;
        return starPoints(
          centerX,
          centerY,
          currentRadius,
          currentRadius * 0.4,
          5,
          currentRotation,
        );
      });
    }
  }
}

/**
 * Synchronously updates the `.dark` class on `document.documentElement` so that
 * View Transition snapshots capture the target palette within the same `flushSync` frame.
 */
export function applyDocumentThemeClass(
  targetTheme: "light" | "dark" | "system",
): void {
  if (typeof document === "undefined")
    return;

  const shouldUseDark =
    targetTheme === "dark" ||
    (targetTheme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  document.documentElement.classList.toggle("dark", shouldUseDark);
}

/**
 * Runs a geometric View Transition expanding from `originElement` (or viewport center)
 * while applying the theme state mutation inside `flushSync`.
 */
export function runThemeViewTransition(
  originElement: HTMLElement | null,
  applyThemeCallback: () => void,
  options?: ThemeViewTransitionOptions,
): void {
  const duration = options?.duration ?? 450;
  const variant = options?.variant ?? "circle";
  const fromCenter = options?.fromCenter ?? false;

  if (
    typeof document === "undefined" ||
    typeof document.startViewTransition !== "function"
  ) {
    applyThemeCallback();
    return;
  }

  const rootElement = document.documentElement;
  if (rootElement.dataset.magicuiThemeVt === "active")
    return;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let centerX = viewportWidth / 2;
  let centerY = viewportHeight / 2;

  if (!fromCenter && originElement) {
    const boundingRect = originElement.getBoundingClientRect();
    centerX = boundingRect.left + boundingRect.width / 2;
    centerY = boundingRect.top + boundingRect.height / 2;
  }

  const maxRadius = Math.hypot(
    Math.max(centerX, viewportWidth - centerX),
    Math.max(centerY, viewportHeight - centerY),
  );

  const clipPath = getClipPathKeyframes(
    variant,
    centerX,
    centerY,
    maxRadius,
    viewportWidth,
    viewportHeight,
  );

  /**
   * Pins the initial collapsed clip-path in CSS before snapshot creation so the browser
   * never paints an unclipped frame prior to the `transition.ready` microtask.
   */
  rootElement.dataset.magicuiThemeVt = "active";
  rootElement.style.setProperty(
    "--magicui-theme-toggle-vt-duration",
    `${duration}ms`,
  );
  rootElement.style.setProperty("--magicui-theme-vt-clip-from", clipPath[0]);

  const cleanupTransitionState = () => {
    delete rootElement.dataset.magicuiThemeVt;
    rootElement.style.removeProperty("--magicui-theme-toggle-vt-duration");
    rootElement.style.removeProperty("--magicui-theme-vt-clip-from");
  };

  const transition = document.startViewTransition(() => {
    flushSync(applyThemeCallback);
  });

  if (typeof transition?.finished?.finally === "function")
    transition.finished.finally(cleanupTransitionState).catch(() => undefined);
  else
    cleanupTransitionState();

  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath },
        {
          duration,
          easing: variant === "star" ? "linear" : "ease-in-out",
          fill: "forwards",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => undefined);
}

/**
 * Theme toggle button with geometric View Transition reveal animation (Magic UI).
 */
export function AnimatedThemeToggler({
  className,
  duration = 450,
  variant = "circle",
  fromCenter = false,
  theme: controlledTheme,
  onThemeChange,
  ...props
}: AnimatedThemeTogglerProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isDark =
    controlledTheme !== undefined
      ? controlledTheme === "dark"
      : isMounted && resolvedTheme === "dark";

  const handleToggleTheme = useCallback(() => {
    const nextTheme: "light" | "dark" = isDark ? "light" : "dark";

    runThemeViewTransition(
      buttonRef.current,
      () => {
        applyDocumentThemeClass(nextTheme);
        if (onThemeChange)
          onThemeChange(nextTheme);
        else
          setTheme(nextTheme);
      },
      { duration, variant, fromCenter },
    );
  }, [duration, fromCenter, isDark, onThemeChange, setTheme, variant]);

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={handleToggleTheme}
      className={cn("cursor-pointer", className)}
      title={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      {...props}
    >
      {isDark ? (
        <SunIcon className="size-3.5" />
      ) : (
        <MoonIcon className="size-3.5" />
      )}
      <span className="sr-only">Alternar tema</span>
    </button>
  );
}
