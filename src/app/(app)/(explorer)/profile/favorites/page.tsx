import Link from "next/link";

import { PlaceCard } from "@/components/blocks/place-card";
import { Button } from "@/components/ui/button";
import { MY_FAVORITES_TAG } from "@/constants/achievements";
import { listMyFavorites } from "@/http/activity/activity";
import { profileFavoriteIdsMock, profilePlace } from "@/mocks/profile";

/**
 * Carrega a lista de lugares favoritados pelo explorador.
 */
async function loadFavoritesData() {
  try {
    const res = await listMyFavorites({ PageSize: 50 }, { next: { tags: [MY_FAVORITES_TAG] } });
    if (res.status === 200 && res.data.items.length > 0) {
      return res.data.items.map((item) => ({
        id: item.placeId,
        nome: item.placeName,
      }));
    }
  } catch {
    // Fallback silencioso para dados em mock
  }

  return profileFavoriteIdsMock.map((id) => ({
    id,
    nome: profilePlace(id).nome,
  }));
}

/**
 * Lugares salvos pelo usuário autenticado.
 */
export default async function ProfileFavoritesPage() {
  const favoritos = await loadFavoritesData();

  if (favoritos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border border-dashed p-12 text-center">
        <p className="text-muted-foreground text-sm">
          Explore o mapa e salve os lugares que você quer revisitar.
        </p>

        <Button asChild>
          <Link href="/discover">Descobrir lugares</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        {favoritos.length} lugares salvos
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {favoritos.map((place) => (
          <PlaceCard
            key={place.id}
            size="featured"
            showTags
            marker={{ id: place.id, nome: place.nome }}
          />
        ))}
      </div>
    </div>
  );
}
