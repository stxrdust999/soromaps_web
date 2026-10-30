import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Administração",
    template: "%s | Admin Soromaps",
  },
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Administrative section layout enforcing non-indexable robot directives and metadata title templating.
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  return children;
}
