import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"

import { db } from "@/database/db"
import * as schema from "@/database/schema"

const ensureHttps = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  return url.startsWith('http') ? url : `https://${url}`;
};

const deploymentUrl = process.env.VERCEL_URL 
  ? ensureHttps(process.env.VERCEL_URL)
  : process.env.BETTER_AUTH_URL;

export const auth = betterAuth({
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
        deploymentUrl,
        process.env.BETTER_AUTH_URL,
        "http://localhost:3000",
        "https://cs5356-hw6-nextjs.vercel.app"
    ].filter((url): url is string => url !== undefined),
    plugins: [
        nextCookies()
    ]
})