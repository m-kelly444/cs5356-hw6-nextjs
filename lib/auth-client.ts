import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    plugins: []
})

declare global {
  interface SessionUser {
    role?: string;
  }
}