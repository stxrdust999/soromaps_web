"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root route-level error boundary capturing runtime rendering exceptions without exposing infrastructure internals.
 */
export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Soromaps runtime error captured by boundary:", error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center bg-background px-4 py-16 text-center">
      <div className="flex max-w-md flex-col items-center gap-6">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="size-8" />
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Instabilidade temporária
          </span>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Ops, algo deu errado
          </h1>
          <p className="text-sm text-muted-foreground">
            Encontramos uma instabilidade inesperada ao carregar esta página. Por favor, tente novamente em alguns instantes.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset} variant="default" className="gap-2">
            <RefreshCw className="size-4" />
            Tentar novamente
          </Button>
          <Button asChild variant="outline">
            <Link href="/home">Voltar ao mapa</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
