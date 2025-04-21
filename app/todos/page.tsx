import { TodoList } from "@/components/TodoList"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { todos } from "@/database/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || "https://your-auth-domain.com"

export const dynamic = 'force-dynamic'

export default async function TodosPage() {
    const headersList = await headers()
    const sessionResponse = await auth.handler(new Request(BETTER_AUTH_URL, { 
        headers: Object.fromEntries(headersList.entries())
    }))

    let session;
    try {
        session = await sessionResponse.json()
    } catch (error) {
        console.error("Failed to parse session response:", error);
        return <div>Authentication error. Please try again later.</div>
    }
    
    if (!session) {
        return <div>Please sign in to view your todos</div>
    }
    
    const userTodos = await db.query.todos.findMany({
        where: eq(todos.userId, session.user.id),
        orderBy: (todos, { desc }) => [desc(todos.createdAt)]
    })

    return (
        <main className="py-8 px-4">
            <section className="container mx-auto">
                <h1 className="text-2xl font-bold mb-6">My Todos</h1>
                <TodoList todos={userTodos} />
            </section>
        </main>
    )
}