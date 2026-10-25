import { cn } from "@/lib/utils";

interface MapPickPinProps {
  className?: string;
}

/**
 * Marcador de mira centralizado inspirado no padrão minimalista do Uber.
 * Composto por uma cabeça circular com núcleo central, haste fina de sustentação
 * e ponto de contato no solo exatamente no centro geométrico.
 */
export function MapPickPin({ className }: MapPickPinProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center select-none pointer-events-none",
        className,
      )}
    >
      {/* Cabeça e Haste suspensas acima do solo */}
      <div className="-translate-y-full flex flex-col items-center drop-shadow-md transition-transform duration-150">
        {/* Cabeça redonda com ponto/quadrado central estilo Uber */}
        <div className="size-8 rounded-full bg-foreground flex items-center justify-center shadow-lg ring-4 ring-background">
          <div className="size-2 rounded-xs bg-background" />
        </div>

        {/* Haste vertical de conexão */}
        <div className="w-0.5 h-4 bg-foreground" />
      </div>

      {/* Ponto exato de impacto e ancoragem no solo */}
      <div className="absolute top-0 -translate-x-1/2 -translate-y-1/2 left-1/2 size-2 rounded-full bg-foreground shadow-sm ring-2 ring-background" />
    </div>
  );
}
