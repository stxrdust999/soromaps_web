"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { registerAction } from "@/actions/auth";
import { PasswordInput } from "@/components/blocks/password-input";
import { Button } from "@/components/ui/button";
import { FlipWords } from "@/components/ui/flip-words";
import { Input } from "@/components/ui/input";
import { responseToast } from "@/lib/toaster";

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      responseToast.error({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos do formulário.",
      });
      return;
    }

    if (password !== confirmPassword) {
      responseToast.error({
        title: "Senhas divergentes",
        description: "A confirmação de senha não confere.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await registerAction({
          name,
          email,
          password,
          confirmPassword,
        });

        if (!result.success) {
          responseToast.error({
            title: "Erro ao criar usuário",
            description: result.message ?? "Erro ao registrar.",
          });
          return;
        }

        responseToast.success({
          title: "Usuário criado com sucesso!",
          description: `Bem-vindo, ${name}! Redirecionando...`,
        });

        router.push("/home");
        router.refresh();
      } catch {
        responseToast.error({
          title: "Erro ao criar usuário",
          description: "Ocorreu um problema ao tentar salvar os dados.",
        });
      }
    });
  };

  return (
    <div className="flex min-h-screen md:h-screen w-full flex-col md:flex-row p-4 gap-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="flex flex-1 items-center justify-center p-6 md:p-12 h-full">
        <div className="w-full max-w-90 flex flex-col gap-6">
          <div className="absolute top-0 left-0 translate-x-8 translate-y-6  text-zinc-900 dark:text-zinc-50">
            <span className="text-xs font-semibold">
              Já faz parte da comunidade?{" "}
            </span>
            <Link
              className="h-auto hover:no-underline w-auto text-xs font-semibold p-0 text-blue-900 hover:text-blue-600 border border-transparent items-center self-center"
              href="/login"
            >
              Faça login
            </Link>
          </div>

          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Junte-se ao Soromaps!
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Descubra{" "}
              <FlipWords
                words={[
                  "os melhores cafés",
                  "aquele pastel lendário",
                  "os parques secretos",
                  "as resenhas sinceras",
                ]}
                className="font-medium text-foreground px-1"
              />{" "}
              de Sorocaba e compartilhe seus achados.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Nome
              </span>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                className="shadow-none text-md h-11 border-zinc-200 focus-visible:border-zinc-400"
                placeholder="Digite seu nome completo..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                E-mail
              </span>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                className="shadow-none text-md h-11 border-zinc-200 focus-visible:border-zinc-400"
                placeholder="Digite seu e-mail..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Senha
              </span>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                className="shadow-none text-md h-11 border-zinc-200 focus-visible:border-zinc-400"
                placeholder="Digite sua senha (mínimo 8 caracteres)..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Confirmar Senha
              </span>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isPending}
                className="shadow-none text-md h-11 border-zinc-200 focus-visible:border-zinc-400"
                placeholder="Confirme sua senha..."
              />
            </div>
          </div>

          <Button
            onClick={handleRegister}
            disabled={isPending}
            className="flex h-11 w-full items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50"
          >
            {isPending ? "Criando conta..." : "Criar conta"}
          </Button>
        </div>
      </div>

      <div className="hidden md:flex flex-1 relative w-full h-full">
        <Image
          src="/register/soromapsRegister.jpg"
          alt="Mapa e conexões sociais"
          fill
          className="object-cover rounded-2xl select-none"
          priority
        />
        <div className="absolute inset-0 bg-black/5 rounded-2xl pointer-events-none" />
      </div>
    </div>
  );
}
