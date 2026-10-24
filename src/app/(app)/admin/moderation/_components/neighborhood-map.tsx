import type { MapNeighborMock } from "@/types/moderation";

const WIDTH = 360;
const HEIGHT = 212;

interface NeighborhoodMapProps {
  neighbors: MapNeighborMock[];
}

/**
 * Recorte esquemático da vizinhança do ponto em julgamento.
 */
export function NeighborhoodMap({ neighbors }: NeighborhoodMapProps) {
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="bg-muted/40 size-full"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`Vizinhança do ponto: ${neighbors.length} pontos já aprovados num raio de 200 metros`}
    >
      <g className="stroke-border/60" strokeWidth={7} strokeLinecap="square">
        <path d="M-10 54 L370 40" />
        <path d="M-10 112 L370 98" />
        <path d="M64 -10 L88 222" />
        <path d="M196 -10 L214 222" />
        <path d="M292 -10 L306 222" />
      </g>

      <g className="stroke-border/40" strokeWidth={2.5}>
        <path d="M-10 84 L370 70" />
        <path d="M132 -10 L148 222" />
        <path d="M252 -10 L266 222" />
      </g>

      <circle
        cx={WIDTH / 2}
        cy={HEIGHT / 2}
        r={62}
        fill="none"
        strokeDasharray="4 5"
        className="stroke-primary/40"
      />

      {neighbors.map((neighbor, index) => (
        <g key={`${neighbor.x}-${neighbor.y}-${index}`}>
          <circle
            cx={neighbor.x * WIDTH}
            cy={neighbor.y * HEIGHT}
            r={4.5}
            className="fill-muted-foreground/60"
          />
          {neighbor.suspeito && (
            <circle
              cx={neighbor.x * WIDTH}
              cy={neighbor.y * HEIGHT}
              r={9}
              fill="none"
              strokeWidth={1.4}
              strokeDasharray="3 3"
              className="stroke-warning"
            />
          )}
        </g>
      ))}

      <circle
        cx={WIDTH / 2}
        cy={HEIGHT / 2}
        r={12}
        className="fill-primary/15"
      />
      <circle
        cx={WIDTH / 2}
        cy={HEIGHT / 2}
        r={6}
        strokeWidth={2.5}
        className="fill-primary stroke-background"
      />
    </svg>
  );
}
