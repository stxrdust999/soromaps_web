import z from "zod";

/**
 * Schema defining supported runtime environment variables and boundary constraints.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_URL: z.string().default("http://localhost:5099"),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  CRON_SECRET: z
    .string()
    .min(16, "CRON_SECRET must be at least 16 characters long.")
    .optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.0-flash"),
});

export type Env = z.infer<typeof envSchema>;

let parsedEnv: Env | null = null;

/**
 * Validates and retrieves typed environment configuration with resilient fallbacks.
 *
 * @returns Fully validated environment variables record.
 */
export function getEnv(): Env {
  if (parsedEnv) return parsedEnv;

  const rawEnv = {
    NODE_ENV: process.env.NODE_ENV,
    API_URL: process.env.API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    CRON_SECRET: process.env.CRON_SECRET?.trim() ? process.env.CRON_SECRET : undefined,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
  };

  const parseResult = envSchema.safeParse(rawEnv);

  if (!parseResult.success) {
    console.warn(
      "Invalid environment variables detected, falling back to safe defaults:",
      parseResult.error.flatten().fieldErrors,
    );

    parsedEnv = {
      NODE_ENV: (process.env.NODE_ENV as Env["NODE_ENV"]) || "development",
      API_URL: process.env.API_URL || "http://localhost:5099",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      CRON_SECRET:
        process.env.CRON_SECRET && process.env.CRON_SECRET.length >= 16
          ? process.env.CRON_SECRET
          : undefined,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    };

    return parsedEnv;
  }

  parsedEnv = parseResult.data;
  return parsedEnv;
}

/**
 * Resolves the application public URL across Vercel environments and local development.
 *
 * @returns Fully qualified base application URL without trailing slash.
 */
export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");

  return "http://localhost:3000";
}

/**
 * Resolves the backend API base URL with fallback to local development port.
 *
 * @returns Fully qualified backend API base URL without trailing slash.
 */
export function getApiUrl(): string {
  return (process.env.API_URL ?? "http://localhost:5099").replace(/\/$/, "");
}
