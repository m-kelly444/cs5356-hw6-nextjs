import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import type { NextRequest } from "next/server"

export default async function middleware(req: NextRequest) {
    const sessionResponse = await auth.handler(new Request("http://localhost", { 
        headers: Object.fromEntries(req.headers.entries())
    }))
    const session = await sessionResponse.json()
    
    const url = req.nextUrl.clone()
    
    if (url.pathname.startsWith("/todos") && !session) {
        url.pathname = "/auth/sign-in"
        url.searchParams.set("callbackUrl", req.nextUrl.pathname)
        return NextResponse.redirect(url)
    }
    
    if (url.pathname.startsWith("/admin") && (!session || session.user.role !== "admin")) {
        url.pathname = "/"
        return NextResponse.redirect(url)
    }
    
    return NextResponse.next()
}

export const config = {
    matcher: ["/todos/:path*", "/admin/:path*"],
}