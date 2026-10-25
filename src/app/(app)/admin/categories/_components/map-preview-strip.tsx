import type { CategoryViewModel } from "./use-categories";

import { CategoryPin } from "./category-pin";

/** Alturas alternadas, para os pins não virarem uma régua. */
const OFFSETS = [0, -14, 10, -6, 14, -10, 4, -16];

interface MapPreviewStripProps {
  categories: CategoryViewModel[];
}

/**
 * Todos os pins ativos sobre um fundo de mapa esquemático.
 *
 * A paleta só se julga junta: uma linha por vez esconde que dois azuis
 * separados por três posições na tabela ficam colados no mapa real.
 */
export function MapPreviewStrip({ categories }: MapPreviewStripProps) {
  const active = categories.filter((category) => category.ativa);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground text-sm">
          Conjunto no mapa · {active.length} pins ativos
        </span>
        <span className="text-muted-foreground text-xs">
          Como a paleta se lê junta, não uma linha por vez
        </span>
      </div>

      <div className="bg-muted/30 relative h-33 overflow-hidden rounded-xl border">
        <svg
          viewBox="0 0 1200 132"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
          aria-hidden="true"
        >
          <g className="stroke-border/60" strokeWidth={9}>
            <path d="M-10 40 L1210 28" />
            <path d="M-10 92 L1210 80" />
            <path d="M180 -10 L206 142" />
            <path d="M520 -10 L546 142" />
            <path d="M860 -10 L886 142" />
          </g>

          <g className="stroke-border/40" strokeWidth={3}>
            <path d="M-10 64 L1210 54" />
            <path d="M340 -10 L364 142" />
            <path d="M700 -10 L724 142" />
            <path d="M1030 -10 L1054 142" />
          </g>
        </svg>

        <ul className="relative flex h-full items-center justify-around px-6">
          {active.map((category, index) => (
            <li
              key={category.id}
              className="flex flex-col items-center gap-2"
              style={{ marginTop: OFFSETS[index % OFFSETS.length] }}
            >
              <CategoryPin
                icone={category.icone}
                cor={category.cor}
                size={30}
                ring
              />
              <span className="text-muted-foreground text-[10.5px] whitespace-nowrap">
                {category.nome}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
