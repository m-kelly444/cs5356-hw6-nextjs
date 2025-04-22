import { TodoList } from "@/components/TodoList"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { todos } from "@/database/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL

export const dynamic = 'force-dynamic'

export default async function TodosPage() {
    if (!BETTER_AUTH_URL) {
        throw new Error("BETTER_AUTH_URL is not defined")
    }
    
    const headersList = headers()

    let session;
    try {
        const headerEntries = Object.fromEntries(headersList.entries());
        session = await auth.api.getSession({ headers: headerEntries });
    } catch (error) {
        console.error("Failed to get session:", error);
        return <div className="p-8">Authentication error. Please try again later.</div>;
    }

    if (!session || !session.user || !session.user.id) {
        return <div className="p-8">Please sign in to view your todos</div>
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