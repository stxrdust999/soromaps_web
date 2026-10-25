"use client";

import { AnimatePresence, motion } from "motion/react";
import React, { useId, useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface GooeyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  containerClassName?: string;
}

/**
 * Campo de busca interativo com deformação orgânica e efeito líquido elástico via filtros SVG.
 */
export function GooeyInput({
  value,
  onChange,
  onClear,
  placeholder = "Buscar...",
  className,
  containerClassName,
  ...inputProperties
}: GooeyInputProps) {
  const filterId = useId();
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChange("");
    if (onClear) onClear();
  };

  return (
    <div className={cn("relative w-full max-w-xl", containerClassName)}>
      <svg className="absolute hidden" aria-hidden="true">
        <defs>
          <filter id={`gooey-effect-${filterId}`}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="gooey"
            />
            <feBlend in="SourceGraphic" in2="gooey" />
          </filter>
        </defs>
      </svg>

      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-visible"
        style={{ filter: `url(#gooey-effect-${filterId})` }}
      >
        <motion.div
          animate={{
            scale: isFocused ? 1.015 : 1,
            opacity: isFocused ? 0.95 : 0.75,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="size-full rounded-2xl bg-zinc-200/80 transition-colors dark:bg-zinc-800/80"
        />

        <AnimatePresence>
          {value && (
            <motion.div
              initial={{ scale: 0, x: 0 }}
              animate={{ scale: 1, x: 0 }}
              exit={{ scale: 0, x: -10 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="absolute right-3 top-1/2 size-7 -translate-y-1/2 rounded-full bg-zinc-300 dark:bg-zinc-700"
            />
          )}
        </AnimatePresence>
      </div>

      <div className="relative flex items-center">
        <SearchIcon className="-translate-y-1/2 pointer-events-none absolute left-3.5 top-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-primary" />

        <input
          {...inputProperties}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={(event) => {
            setIsFocused(true);
            inputProperties.onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            inputProperties.onBlur?.(event);
          }}
          placeholder={placeholder}
          className={cn(
            "h-11 w-full rounded-2xl bg-transparent py-2 pl-10 pr-10 text-sm font-medium outline-hidden ring-0 transition-all",
            "text-foreground placeholder:text-muted-foreground",
            "focus-visible:outline-hidden",
            className,
          )}
        />

        <AnimatePresence>
          {value && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClear}
              className="-translate-y-1/2 absolute right-2.5 top-1/2 flex size-7 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-black/5 hover:text-foreground dark:text-zinc-400 dark:hover:bg-white/10"
              title="Limpar busca"
            >
              <XIcon className="size-3.5" />
              <span className="sr-only">Limpar busca</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
