import { cn } from "@/lib/utils";
import {
  countFilledFields,
  MODERATION_FIELDS,
  type ModerationFieldsMock,
} from "@/types/moderation";

const MINIMUM_FIELDS = 7;

interface PointFieldsProps {
  campos: ModerationFieldsMock;
}

/**
 * Ficha completa do ponto em análise na moderação.
 */
export function PointFields({ campos }: PointFieldsProps) {
  const filled = countFilledFields(campos);
  const enough = filled >= MINIMUM_FIELDS;

  return (
    <div className="flex flex-col gap-3">
      {/* header - status */}
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-heading font-semibold">Ficha do ponto</h3>
        <span className="text-muted-foreground text-xs">
          {enough ? "Suficiente para publicar" : "Abaixo do mínimo recomendado"}
        </span>
      </div>

      {/* fields - list */}
      <dl>
        {MODERATION_FIELDS.map(({ key, label }, index) => (
          <div
            key={key}
            className={cn(
              "grid grid-cols-[130px_1fr] items-baseline gap-4 rounded-md px-2.5 py-2",
              index % 2 === 1 && "bg-muted/40",
            )}
          >
            <dt className="text-muted-foreground text-sm">{label}</dt>
            <dd
              className={cn(
                "text-sm",
                !campos[key] && "text-muted-foreground/80",
              )}
            >
              {campos[key] ?? "não informado"}
            </dd>
          </div>
        ))}
      </dl>

      {/* completeness - bar */}
      <div className="flex flex-col gap-1.5 px-2.5">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Completude</span>
          <span className="text-sm font-semibold">
            {filled} de {MODERATION_FIELDS.length} campos
          </span>
        </div>

        <div className="bg-muted h-1.5 overflow-hidden rounded-full">
          <div
            className={cn(
              "h-full rounded-full",
              enough ? "bg-chart-3" : "bg-warning",
            )}
            style={{
              width: `${(filled / MODERATION_FIELDS.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
