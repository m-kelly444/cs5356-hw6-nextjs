import { createAuthClient } from "better-auth/react"

declare module "better-auth/react" {
  interface SessionUser {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    image?: string | null;
    role?: string;
  }
}