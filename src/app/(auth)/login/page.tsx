"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { loginAction } from "@/actions/auth";
import { PasswordInput } from "@/components/blocks/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { responseToast } from "@/lib/toaster";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      responseToast.error({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o e-mail e a senha.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await loginAction({ email, password });

        if (!result.success) {
          responseToast.error({
            title: "Erro ao entrar na conta",
            description: result.message ?? "Credenciais inválidas.",
          });
          return;
        }

        responseToast.success({
          title: "Login bem-sucedido!",
          description: "Redirecionando para a plataforma...",
        });

        router.push("/home");
        router.refresh();
      } catch {
        responseToast.error({
          title: "Erro ao entrar na conta",
          description: "Ocorreu um problema de conexão com o servidor.",
        });
      }
    });
  };

  return (
    <div className="flex min-h-screen md:h-screen w-full flex-col md:flex-row p-4 gap-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="flex flex-1 items-center justify-center p-6 md:p-12 h-full">
        <div className="w-full max-w-90 flex flex-col gap-6">
          <div className="absolute top-0 left-0 translate-x-8 translate-y-6  text-zinc-900 dark:text-zinc-50">
            <span className="text-xs font-semibold">Novo por aqui? </span>
            <Link
              className="h-auto hover:no-underline w-auto text-xs font-semibold p-0 text-foreground hover:text-blue-600 border border-transparent items-center self-center"
              href="/register"
            >
              Crie uma conta
            </Link>
          </div>

          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Boas-vindas
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Insira suas credenciais para entrar na plataforma
            </p>
          </div>

          <div className="flex flex-col gap-4">
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
                placeholder="Digite sua senha..."
              />

              <Link
                className="h-auto hover:no-underline w-auto text-xs font-semibold p-0 text-foreground hover:text-blue-600 border border-transparent items-center self-center"
                href="#"
              >
                Esqueci minha senha
              </Link>
            </div>
          </div>

          <Button
            onClick={handleLogin}
            disabled={isPending}
            className="flex h-11 w-full items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50"
          >
            {isPending ? "Entrando..." : "Entrar"}
          </Button>
        </div>
      </div>

      <div className="hidden md:flex flex-1 relative w-full h-full">
        <Image
          src="/login/soromapsLogin.jpeg"
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
