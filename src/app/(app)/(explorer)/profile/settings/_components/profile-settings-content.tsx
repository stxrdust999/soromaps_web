"use client";

import {
  BellOffIcon,
  CameraIcon,
  CheckIcon,
  KeyRoundIcon,
  Loader2Icon,
  MailIcon,
  SaveIcon,
  ShieldIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteFeedMuteAction } from "@/actions/feed";
import { createPlacePhotoUploadUrlAction } from "@/actions/places";
import {
  changeEmailAction,
  changePasswordAction,
  deleteCurrentUserAction,
  updateCurrentUserAction,
} from "@/actions/users";
import { ImageCropperDialog } from "@/components/blocks/image-cropper-dialog";
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
import { createAvatarUploadUrl, type getCurrentUserResponse } from "@/http/users/users";

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

  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isPending, startTransition] = useTransition();
  const [isEmailPending, startEmailTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImageSource, setSelectedImageSource] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputReference = useRef<HTMLInputElement | null>(null);

  const handleChangeEmail = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newEmail.trim()) {
      toast.error("Informe um novo e-mail válido.");
      return;
    }
    if (!emailPassword) {
      toast.error("Informe sua senha para confirmar a troca de e-mail.");
      return;
    }

    startEmailTransition(async () => {
      const result = await changeEmailAction({
        newEmail: newEmail.trim(),
        password: emailPassword,
      });

      if (result.success) {
        toast.success(result.message);
        setNewEmail("");
        setEmailPassword("");
        router.refresh();
        return;
      }

      toast.error(result.message);
    });
  };

  const handleChangePassword = (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentPassword) {
      toast.error("Informe sua senha atual.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      toast.error("A nova senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    startPasswordTransition(async () => {
      const result = await changePasswordAction({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (result.success) {
        toast.success(result.message);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        return;
      }

      toast.error(result.message);
    });
  };

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

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione um arquivo de imagem válido.");
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = () => {
      setSelectedImageSource(fileReader.result as string);
      setCropperOpen(true);
    };
    fileReader.readAsDataURL(file);

    event.target.value = "";
  };

  const handleCropComplete = async (croppedFile: File, croppedPreviewUrl: string) => {
    setIsUploadingAvatar(true);

    try {
      const avatarUploadResponse = await createAvatarUploadUrl({
        fileExtension: "jpg",
      });

      if (avatarUploadResponse.status === 200 && avatarUploadResponse.data?.uploadUrl) {
        const uploadResponse = await fetch(avatarUploadResponse.data.uploadUrl, {
          method: "PUT",
          body: croppedFile,
          headers: {
            "Content-Type": "image/jpeg",
          },
        });

        if (uploadResponse.ok) {
          const publicUrl = avatarUploadResponse.data.publicUrl;
          setAvatarUrl(publicUrl);
          setCropperOpen(false);
          setSelectedImageSource(null);
          toast.success("Foto de perfil enviada com sucesso.");
          return;
        }
      }

      const uploadFallbackResult = await createPlacePhotoUploadUrlAction("profile", "jpg");
      if (uploadFallbackResult.success && uploadFallbackResult.data?.uploadUrl) {
        const fallbackResponse = await fetch(uploadFallbackResult.data.uploadUrl, {
          method: "PUT",
          body: croppedFile,
          headers: {
            "Content-Type": "image/jpeg",
          },
        });

        if (fallbackResponse.ok) {
          const fallbackPublicUrl = uploadFallbackResult.data.publicUrl;
          setAvatarUrl(fallbackPublicUrl);
          setCropperOpen(false);
          setSelectedImageSource(null);
          toast.success("Foto de perfil enviada com sucesso.");
          return;
        }
      }

      setAvatarUrl(croppedPreviewUrl);
      setCropperOpen(false);
      setSelectedImageSource(null);
      toast.success("Foto de perfil atualizada temporariamente.");
    } catch (error) {
      console.error("Falha ao enviar foto de perfil:", error);
      toast.error("Não foi possível enviar a foto recortada.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmationText.trim().toUpperCase() !== "EXCLUIR") {
      toast.error("Digite EXCLUIR para confirmar a exclusão da conta.");
      return;
    }

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
                {/* avatar - field */}
                <div className="flex items-center gap-5">
                  <div className="relative group">
                    <Avatar className="size-20 border-2 border-border shadow-sm">
                      <AvatarImage src={avatarUrl || undefined} alt={user.name} className="object-cover" />
                      <AvatarFallback className="text-xl font-bold">
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <label
                      htmlFor="avatar-file-upload"
                      className="absolute bottom-0 right-0 flex size-7 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-110 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                      title="Alterar foto de perfil"
                    >
                      {isUploadingAvatar ? (
                        <Loader2Icon className="size-3.5 animate-spin" />
                      ) : (
                        <CameraIcon className="size-3.5" />
                      )}
                      <span className="sr-only">Alterar foto de perfil</span>
                    </label>

                    <input
                      id="avatar-file-upload"
                      type="file"
                      ref={fileInputReference}
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      onChange={handleFileSelected}
                      disabled={isUploadingAvatar}
                    />
                  </div>

                  <div className="flex flex-1 flex-col gap-1">
                    <Label htmlFor="avatar-file-upload" className="font-medium text-sm">
                      Foto de perfil
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Formatos JPG, PNG ou WEBP. Clique no ícone de câmera para ajustar e recortar.
                    </p>
                    {avatarUrl ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-fit h-6 px-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setAvatarUrl("")}
                        disabled={isUploadingAvatar}
                      >
                        Remover foto
                      </Button>
                    ) : null}
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
            {/* access-data - section */}
            <Card>
              <CardHeader>
                <CardTitle>Dados de Acesso</CardTitle>
                <CardDescription>
                  Credenciais e nível de acesso associados à sua conta.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 max-w-lg">
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

            {/* change-email - section */}
            <Card>
              <CardHeader>
                <CardTitle>Alteração de E-mail</CardTitle>
                <CardDescription>
                  Atualize o endereço de e-mail utilizado para autenticação no sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangeEmail} className="flex flex-col gap-4 max-w-lg">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="current-email">E-mail atual</Label>
                    <Input id="current-email" value={user.email} disabled className="bg-muted/50" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="new-email">Novo e-mail</Label>
                    <Input
                      id="new-email"
                      type="email"
                      value={newEmail}
                      onChange={(event) => setNewEmail(event.target.value)}
                      placeholder="novo@exemplo.com"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email-password">Senha de confirmação</Label>
                    <Input
                      id="email-password"
                      type="password"
                      value={emailPassword}
                      onChange={(event) => setEmailPassword(event.target.value)}
                      placeholder="Digite sua senha atual"
                      required
                    />
                  </div>

                  <Button type="submit" disabled={isEmailPending} className="w-fit gap-2">
                    {isEmailPending ? (
                      <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                      <MailIcon className="size-4" />
                    )}
                    Atualizar e-mail
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* change-password - section */}
            <Card>
              <CardHeader>
                <CardTitle>Alteração de Senha</CardTitle>
                <CardDescription>
                  Defina uma nova senha para manter sua conta protegida.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="flex flex-col gap-4 max-w-lg">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="current-password">Senha atual</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      placeholder="Digite sua senha atual"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="new-password">Nova senha</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="Mínimo de 8 caracteres"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Repita a nova senha"
                      required
                    />
                  </div>

                  <Button type="submit" disabled={isPasswordPending} className="w-fit gap-2">
                    {isPasswordPending ? (
                      <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                      <KeyRoundIcon className="size-4" />
                    )}
                    Atualizar senha
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* danger-zone - section */}
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
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(isOpen) => {
          setDeleteDialogOpen(isOpen);
          if (!isOpen) setDeleteConfirmationText("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir conta definitivamente?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Suas avaliações e locais criados serão desvinculados
              e seu acesso será revogado imediatamente.
            </DialogDescription>
          </DialogHeader>

          {/* delete-confirmation - field */}
          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="delete-account-input" className="text-sm font-medium">
              Para confirmar a exclusão, digite <span className="font-bold text-destructive">EXCLUIR</span> abaixo:
            </Label>
            <Input
              id="delete-account-input"
              value={deleteConfirmationText}
              onChange={(event) => setDeleteConfirmationText(event.target.value)}
              placeholder="Digite EXCLUIR para confirmar"
              disabled={isPending}
              autoComplete="off"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteConfirmationText("");
              }}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isPending || deleteConfirmationText.trim().toUpperCase() !== "EXCLUIR"}
            >
              {isPending ? "Excluindo..." : "Confirmar exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recorte interativo de foto de perfil */}
      <ImageCropperDialog
        open={cropperOpen}
        onOpenChange={(isOpen) => {
          setCropperOpen(isOpen);
          if (!isOpen) setSelectedImageSource(null);
        }}
        imageSource={selectedImageSource}
        onCropComplete={handleCropComplete}
        isSubmitting={isUploadingAvatar}
      />
    </div>
  );
}
