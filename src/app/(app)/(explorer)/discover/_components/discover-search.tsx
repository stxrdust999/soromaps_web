"use client";

import { useCallback } from "react";

import { GooeyInput } from "@/components/ui/gooey-input";

interface DiscoverSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
}

const EXPANDED_OFFSET = 48;
const EXPANDED_WIDTH = 520;

/**
 * Campo de busca principal da tela Descobrir com efeito elástico orgânico,
 * alinhado visualmente à superfície translúcida e dimensões da busca no mapa.
 */
export function DiscoverSearch({
  search,
  onSearchChange,
}: DiscoverSearchProps) {
  const handleClear = useCallback(() => {
    onSearchChange("");
  }, [onSearchChange]);

  return (
    <div className="relative w-full max-w-lg sm:max-w-xl md:max-w-2xl">
      {/* search gooey input - component */}
      <GooeyInput
        collapsedWidth={290}
        expandedWidth={EXPANDED_WIDTH}
        expandedOffset={EXPANDED_OFFSET}
        placeholder="Buscar por nome do lugar..."
        value={search}
        onValueChange={onSearchChange}
        onClear={handleClear}
        surfaceClassName="bg-background/80 dark:bg-black/60 text-foreground dark:text-neutral-100 backdrop-blur-md shadow-none border border-border/40 dark:border-white/15"
        className="justify-start"
      />
    </div>
  );
}
