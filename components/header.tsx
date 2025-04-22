import Link from "next/link"
import { UserButton } from "@daveyplate/better-auth-ui"
import { Button } from "./ui/button"
import { cookies } from "next/headers"
import { auth } from "@/lib/auth"
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function Header() {
    const cookieStore = await cookies()
    const headers = new Headers()
    headers.append('cookie', cookieStore.toString())
    const session = await auth.api.getSession({ headers })
    const isAdmin = session?.user?.role === "admin" || false
    return (
        <header className="sticky top-0 z-50 px-4 py-3 border-b bg-background/60 backdrop-blur">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        CS 5356 – HW 6
                    </Link>
                    <nav className="flex items-center gap-2">
                        <Link href="/todos">
                            <Button variant="ghost">Todos</Button>
                        </Link>
                        {isAdmin && (
                            <Link href="/admin">
                                <Button variant="ghost">Admin</Button>
                            </Link>
                        )}
                    </nav>
                </div>

                <UserButton />
            </div>
        </header>
    )
}