"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Catastrophic error boundary replacing the root HTML shell if RootLayout fails during execution.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Critical root error captured by global boundary:", error);
  }, [error]);

  return (
    <html lang="pt-BR" className="h-full bg-zinc-950 text-zinc-100">
      <body className="flex min-h-full flex-col items-center justify-center p-4 text-center antialiased">
        <div className="flex max-w-md flex-col items-center gap-6">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <AlertTriangle className="size-8" />
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Falha Crítica
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
              Erro de Inicialização
            </h1>
            <p className="text-sm text-zinc-400">
              Ocorreu um erro estrutural ao carregar o aplicativo Soromaps. Tente recarregar a aplicação.
            </p>
          </div>

          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            <RefreshCw className="size-4" />
            Recarregar aplicação
          </button>
        </div>
      </body>
    </html>
  );
}
