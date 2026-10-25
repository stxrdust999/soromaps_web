import { ArrowRightIcon, ClockIcon } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AttentionQueueItem } from "@/types/dashboard";
import { formatWaitingDays } from "@/utils/formatters/format-waiting-days";

interface AttentionQueuesProps {
  queues: AttentionQueueItem[];
}

/**
 * As filas de trabalho do admin. Cada linha é um atalho: o contador diz
 * quanto tem, a idade do mais antigo diz o quanto atrasou, e a linha inteira
 * leva para a tela onde a fila se despacha.
 */
export function AttentionQueues({ queues }: AttentionQueuesProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fila</TableHead>
          <TableHead className="w-40">Pendentes</TableHead>
          <TableHead className="w-48">Mais antigo</TableHead>
          <TableHead className="w-16" />
        </TableRow>
      </TableHeader>

      <TableBody>
        {queues.map((queue) => (
          <TableRow key={queue.label} className="group">
            <TableCell className="font-medium">{queue.label}</TableCell>

            <TableCell className="tabular-nums">{queue.pendentes}</TableCell>

            <TableCell>
              <Badge variant="secondary" className="gap-1 font-normal">
                <ClockIcon size={12} className="text-muted-foreground" />
                {formatWaitingDays(queue.aguardandoHaDias)}
              </Badge>
            </TableCell>

            <TableCell className="text-right">
              <Link
                href={queue.href}
                aria-label={`Abrir ${queue.label}`}
                className="inline-flex text-muted-foreground transition-all hover:translate-x-0.5 hover:text-foreground hover:no-underline"
              >
                <ArrowRightIcon size={16} />
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

