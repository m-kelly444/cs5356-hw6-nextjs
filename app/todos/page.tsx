import { TodoList } from "@/components/TodoList"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { todos } from "@/database/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"

export const dynamic = 'force-dynamic'

export default async function TodosPage() {
    const headersList = await headers()
    const sessionResponse = await auth.handler(new Request("http://localhost", { 
        headers: Object.fromEntries(headersList.entries())
    }))
    const session = await sessionResponse.json()
    
    if (!session) {
        return null
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