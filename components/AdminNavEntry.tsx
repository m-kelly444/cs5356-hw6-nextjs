"use client"

import Link from "next/link"
import { Button } from "./ui/button"
import { useSession } from "@/lib/auth-client"

export function AdminNavEntry() {
    const { data: session } = useSession()
    const isAdmin = session?.user?.role === "admin"
    if (!isAdmin) {
        return null
    }
    
    return (
        <Link href="/admin">
            <Button variant="ghost">Admin</Button>
        </Link>
    )
}