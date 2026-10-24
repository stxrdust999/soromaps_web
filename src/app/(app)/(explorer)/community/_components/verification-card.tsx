import { BadgeCheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ExplorerStats,
  isVerifiedExplorer,
  MIN_MONTHS,
  MIN_REVIEWS,
  MIN_VISITS,
  missingForVerification,
} from "@/constants/verification";
import type { UserVerificationStatusDto } from "@/http/api.schemas";

interface VerificationCardProps {
  verificationStatus?: UserVerificationStatusDto | null;
  fallbackStats?: ExplorerStats | null;
}

function parseNumeric(value: number | string | null | undefined, fallback = 0): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

/**
 * O que é o selo e onde o usuário está em relação a ele.
 */
export function VerificationCard({
  verificationStatus,
  fallbackStats,
}: VerificationCardProps) {
  const stats: ExplorerStats = verificationStatus
    ? {
        visitas: parseNumeric(verificationStatus.visitsCount, 0),
        avaliacoes: parseNumeric(verificationStatus.publishedReviewsCount, 0),
        avaliacoesRemovidas: parseNumeric(
          verificationStatus.removedReviewsCount,
          0,
        ),
        mesesNaPlataforma: Math.floor(
          parseNumeric(verificationStatus.accountAgeDays, 0) / 30,
        ),
      }
    : (fallbackStats ?? {
        visitas: 0,
        avaliacoes: 0,
        avaliacoesRemovidas: 0,
        mesesNaPlataforma: 0,
      });

  const verified = verificationStatus
    ? Boolean(verificationStatus.isVerified)
    : isVerifiedExplorer(stats);
  const missing = missingForVerification(stats);

  return (
    <Card size="sm" className="gap-3">
      {/* header - title */}
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BadgeCheckIcon className="size-4 fill-sky-500 text-white" />
          Explorador verificado
        </CardTitle>
        <CardDescription>
          O selo que aparece ao lado do nome em avaliação, ranking e feed
        </CardDescription>
      </CardHeader>

      {/* criteria - status */}
      <CardContent className="flex flex-col gap-3">
        <ul className="flex flex-col gap-1 text-muted-foreground text-xs">
          <li>· {MIN_VISITS} visitas registradas</li>
          <li>· {MIN_REVIEWS} avaliações publicadas</li>
          <li>· nenhuma avaliação removida pela moderação</li>
          <li>· {MIN_MONTHS} mês de conta</li>
        </ul>

        {verified ? (
          <Badge variant="success">Você tem o selo</Badge>
        ) : (
          <div className="flex flex-col gap-1.5">
            <Badge variant="warning">Falta pouco</Badge>
            <span className="text-muted-foreground text-xs">
              Para conseguir: {missing.join(", ")}.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
