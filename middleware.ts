import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function middleware(request: NextRequest) {
    try {
        const pathname = request.nextUrl.pathname
        const headers = request.headers
        const session = await auth.api.getSession({ headers })

        if (pathname === '/todos' && !session?.user) {
            return NextResponse.redirect(new URL('/auth/sign-in', request.url))
        }

        if (pathname === '/admin') {
            if (!session?.user) {
                return NextResponse.redirect(new URL('/auth/sign-in', request.url))
            }

            if (session.user.role !== 'admin') {
                return NextResponse.redirect(new URL('/', request.url))
            }
        }

        return NextResponse.next()
    } catch (error) {
        console.error('Middleware error:', error)
        return NextResponse.next()
    }
}

export const config = {
    matcher: ['/todos', '/admin']
}