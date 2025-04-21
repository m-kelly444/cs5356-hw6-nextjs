import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"

import { db } from "@/database/db"
import * as schema from "@/database/schema"

const ensureHttps = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  return url.startsWith('http') ? url : `https://${url}`;
};

const baseUrl = process.env.BETTER_AUTH_URL || (
  process.env.VERCEL_URL ? ensureHttps(process.env.VERCEL_URL) : undefined
);

export const auth = betterAuth({
    baseUrl,
    database: drizzleAdapter(db, {
        provider: "pg",
        usePlural: true,
        schema
    }),
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60 
        }
    },
    emailAndPassword: {
        enabled: true
    },
    trustedOrigins: [
        baseUrl,
        "http://localhost:3000",
        "https://cs5356-hw6-nextjs.vercel.app"
    ].filter((url): url is string => url !== undefined),
    plugins: [
        nextCookies()
    ]
})