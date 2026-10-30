import Link from "next/link";
import { Compass, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Global 404 page rendered when a requested route or dynamic entity does not exist.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-center">
      <div className="flex max-w-md flex-col items-center gap-6">
        <div className="relative flex size-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Compass className="size-10 animate-spin-slow" />
          <MapPin className="absolute -bottom-1 -right-1 size-5 text-destructive" />
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Erro 404 · Fora do mapa
          </span>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Ponto não encontrado
          </h1>
          <p className="text-sm text-muted-foreground">
            Parece que você explorou um caminho que não existe no mapa de Sorocaba. O local pode ter sido removido ou o link está incorreto.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="default">
            <Link href="/home">Voltar ao mapa</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/discover">Explorar lugares</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
