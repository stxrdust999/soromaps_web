"use client";

import { GooeyInput } from "@/components/ui/gooey-input";

interface DiscoverSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
}

/**
 * Campo de busca principal da tela Descobrir com efeito elástico orgânico.
 */
export function DiscoverSearch({
  search,
  onSearchChange,
}: DiscoverSearchProps) {
  return (
    <GooeyInput
      value={search}
      onChange={onSearchChange}
      placeholder="Buscar por nome do lugar..."
      containerClassName="w-full max-w-full"
    />
  );
}
