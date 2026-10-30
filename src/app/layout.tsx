import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getAppUrl } from "@/config/env";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: {
    default: "Soromaps — Descubra e Avalie Lugares em Sorocaba",
    template: "%s | Soromaps",
  },
  description:
    "Descubra, avalie e compartilhe experiências autênticas em estabelecimentos e espaços urbanos de Sorocaba.",
  applicationName: "Soromaps",
  keywords: [
    "Sorocaba",
    "mapa colaborativo",
    "guia local",
    "lugares em Sorocaba",
    "avaliações",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Soromaps",
    title: "Soromaps — Descubra e Avalie Lugares em Sorocaba",
    description:
      "Descubra, avalie e compartilhe experiências autênticas em estabelecimentos e espaços urbanos de Sorocaba.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Soromaps — Descubra e Avalie Lugares em Sorocaba",
    description:
      "Descubra, avalie e compartilhe experiências autênticas em estabelecimentos e espaços urbanos de Sorocaba.",
  },
  icons: {
    icon: [
      { url: "/logo/logoipsum-emblem.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
  },
};

/**
 * Root application layout establishing font variables, global theme providers, and notification toasts.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
        plusJakartaSans.variable,
      )}
    >
      <body className="min-h-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <TooltipProvider>{children}</TooltipProvider>

          <Toaster
            position="bottom-right"
            richColors
            duration={5000}
            closeButton
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
