"use client";

import { BookmarkIcon, CheckCircle2Icon, Loader2Icon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  checkInVisitAction,
  toggleFavoritePlaceAction,
} from "@/actions/activity";
import { Button } from "@/components/ui/button";

interface PlaceActivityActionsProps {
  placeId: string;
  initialFavorite?: boolean;
  initialVisitedToday?: boolean;
}

/**
 * Controles de atividade do explorador em um local (check-in por geolocalização e favoritar).
 */
export function PlaceActivityActions({
  placeId,
  initialFavorite = false,
  initialVisitedToday = false,
}: PlaceActivityActionsProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [visitedToday, setVisitedToday] = useState(initialVisitedToday);
  const [checkingIn, setCheckingIn] = useState(false);
  const [isPending, startTransition] = useTransition();

  const executeCheckIn = (latitude: number, longitude: number) => {
    startTransition(async () => {
      const result = await checkInVisitAction(placeId, latitude, longitude);

      setCheckingIn(false);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setVisitedToday(true);
      toast.success(result.message);
    });
  };

  const handleCheckIn = () => {
    if (visitedToday) {
      toast.info("Você já realizou check-in neste local hoje.");
      return;
    }

    setCheckingIn(true);
    if (!navigator.geolocation) {
      executeCheckIn(0, 0);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        executeCheckIn(position.coords.latitude, position.coords.longitude);
      },
      () => {
        // Fallback gracioso caso a permissão do GPS seja negada
        executeCheckIn(0, 0);
      },
      { enableHighAccuracy: true, timeout: 6000 },
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
      {/* check-in - button */}
      <Button
        variant={visitedToday ? "secondary" : "outline"}
        size="sm"
        onClick={handleCheckIn}
        disabled={checkingIn || isPending || visitedToday}
      >
        {checkingIn ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <CheckCircle2Icon className="size-4 text-emerald-600 dark:text-emerald-400" />
        )}
        {visitedToday ? "Visitado hoje" : "Fazer check-in"}
      </Button>

      {/* favorite - button */}
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
