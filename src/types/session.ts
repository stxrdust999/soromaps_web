export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "explorer" | "admin";
  avatarUrl?: string | null;
  neighborhood?: string | null;
}

export interface SessionPayload extends SessionUser {
  exp?: number;
}
