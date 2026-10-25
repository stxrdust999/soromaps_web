"use client";

import {
  BellOffIcon,
  CameraIcon,
  CheckIcon,
  Loader2Icon,
  SaveIcon,
  ShieldIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteFeedMuteAction } from "@/actions/feed";
import { deleteCurrentUserAction, updateCurrentUserAction } from "@/actions/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { listFeedMutesResponse } from "@/http/feed/feed";
import type { getCurrentUserResponse } from "@/http/users/users";

interface ProfileSettingsContentProps {
  promises: {
    userPromise: Promise<getCurrentUserResponse>;
    mutesPromise: Promise<listFeedMutesResponse>;
  };
}

/**
 * Painel completo de configurações da conta do explorador dividido por abas.
 */
export function ProfileSettingsContent({ promises }: ProfileSettingsContentProps) {
  const router = useRouter();
  const userResponse = use(promises.userPromise);
  const mutesResponse = use(promises.mutesPromise);

  const user = userResponse.status === 200 ? userResponse.data : null;
  const mutes = useMemo(() => {
    if (mutesResponse.status === 200 && Array.isArray(mutesResponse.data)) {
      return mutesResponse.data;
    }
    return [];
  }, [mutesResponse]);

  const [name, setName] = useState(user?.name ?? "");
  const [neighborhood, setNeighborhood] = useState(user?.neighborhood ?? "");
  const [biography, setBiography] = useState(user?.biography ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");

  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleSaveProfile = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("O nome é obrigatório.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", name.trim());
      formData.set("neighborhood", neighborhood.trim());
      formData.set("biography", biography.trim());
      formData.set("avatarUrl", avatarUrl.trim());

      const result = await updateCurrentUserAction(formData);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDeleteAccount = () => {
    startTransition(async () => {
      const result = await deleteCurrentUserAction();
      if (result.success) {
        toast.success("Conta excluída com sucesso.");
        router.push("/login");
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleRemoveMute = (muteId: string) => {
    startTransition(async () => {
      const result = await deleteFeedMuteAction(muteId);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  if (!user) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        Não foi possível carregar as informações do perfil.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="conta">Conta</TabsTrigger>
          <TabsTrigger value="preferencias">Preferências</TabsTrigger>
        </TabsList>

        {/* Tab Perfil */}
        <TabsContent value="perfil" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Públicas</CardTitle>
              <CardDescription>
                Atualize seus dados visíveis para a comunidade de exploradores.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-6 max-w-lg">
                <div className="flex items-center gap-5">
                  <Avatar className="size-20 border-2 border-border shadow-sm">
                    <AvatarImage src={avatarUrl || undefined} alt={user.name} />
                    <AvatarFallback className="text-xl font-bold">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-1 flex-col gap-1.5">
                    <Label htmlFor="avatar-url">URL da Foto de Perfil</Label>
                    <Input
                      id="avatar-url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://exemplo.com/minha-foto.jpg"
                      className="text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="neighborhood">Bairro em Sorocaba</Label>
                  <Input
                    id="neighborhood"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Ex: Campolim, Centro, Além Ponte"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="biography">Biografia</Label>
                  <Textarea
                    id="biography"
                    value={biography}
                    onChange={(e) => setBiography(e.target.value)}
                    placeholder="Conte um pouco sobre suas explorações e locais favoritos na cidade..."
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={isPending} className="w-fit gap-2">
                  {isPending ? <Loader2Icon className="size-4 animate-spin" /> : <SaveIcon className="size-4" />}
                  Salvar alterações
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Conta */}
        <TabsContent value="conta" className="mt-6">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados de Acesso</CardTitle>
                <CardDescription>
                  Credenciais e nível de acesso associados à sua conta.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 max-w-lg">
                <div className="flex flex-col gap-1.5">
                  <Label>E-mail cadastrado</Label>
                  <Input value={user.email} disabled className="bg-muted/50" />
                  <span className="text-xs text-muted-foreground">
                    O e-mail é utilizado para login e notificações do sistema.
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Tipo de usuário</Label>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      <ShieldIcon className="size-3.5" />
                      {user.role === "admin" ? "Administrador" : "Explorador"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
                <CardDescription>
                  A exclusão de conta é permanente e removerá suas informações pessoais.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="gap-2"
                >
                  <Trash2Icon className="size-4" />
                  Excluir minha conta
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Preferências */}
        <TabsContent value="preferencias" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Silenciamentos do Feed</CardTitle>
              <CardDescription>
                Bairros, categorias e eventos que você optou por ocultar ou ver menos no feed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mutes.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Você não possui nenhum filtro de silenciamento ativo no feed.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {mutes.map((mute) => (
                    <div
                      key={mute.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-3">
                        <BellOffIcon className="size-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{mute.scopeValue}</p>
                          <span className="text-xs text-muted-foreground">
                            {mute.scopeType === 0
                              ? "Categoria silenciada"
                              : mute.scopeType === 1
                                ? "Bairro silenciado"
                                : "Item silenciado"}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleRemoveMute(mute.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmação de exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir conta definitivamente?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Suas avaliações e locais criados serão desvinculados
              e seu acesso será revogado imediatamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isPending}
            >
              {isPending ? "Excluindo..." : "Sim, excluir minha conta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
