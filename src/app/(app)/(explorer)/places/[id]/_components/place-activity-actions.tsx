"use client";

import { BookmarkIcon, CheckCircle2Icon, Loader2Icon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { checkInVisitAction, toggleFavoritePlaceAction } from "@/actions/activity";
import { Button } from "@/components/ui/button";

interface PlaceActivityActionsProps {
  placeId: string;
  initialFavorite?: boolean;
}

/**
 * Explorer activity controls for a place (geolocation check-in and favorite toggling).
 */
export function PlaceActivityActions({
  placeId,
  initialFavorite = false,
}: PlaceActivityActionsProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [checkingIn, setCheckingIn] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCheckIn = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada no seu navegador.");
      return;
    }

    setCheckingIn(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        startTransition(async () => {
          const result = await checkInVisitAction(
            placeId,
            position.coords.latitude,
            position.coords.longitude,
          );

          setCheckingIn(false);
          if (!result.success) {
            toast.error(result.message);
            return;
          }

          toast.success(result.message);
        });
      },
      (error) => {
        setCheckingIn(false);
        console.error("Geolocation error:", error);
        toast.error("Não foi possível obter sua localização atual para o check-in.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleToggleFavorite = () => {
    startTransition(async () => {
      const nextState = !isFavorite;
      setIsFavorite(nextState);

      const result = await toggleFavoritePlaceAction(placeId, isFavorite);
      if (!result.success) {
        setIsFavorite(!nextState);
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCheckIn}
        disabled={checkingIn || isPending}
      >
        {checkingIn ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <CheckCircle2Icon className="size-4 text-emerald-600 dark:text-emerald-400" />
        )}
        Fazer check-in
      </Button>

      <Button
        variant={isFavorite ? "secondary" : "outline"}
        size="sm"
        onClick={handleToggleFavorite}
        disabled={isPending}
      >
        <BookmarkIcon
          className={`size-4 ${isFavorite ? "fill-primary text-primary" : ""}`}
        />
        {isFavorite ? "Salvo" : "Salvar"}
      </Button>
    </div>
  );
}
