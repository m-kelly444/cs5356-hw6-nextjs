import { desc } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { todos } from "@/database/schema"
import { Button } from "@/components/ui/button"
import { deleteTodo } from "@/actions/todos"
import { headers } from "next/headers"
import { HelpCircleIcon } from "lucide-react"
const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL
export const dynamic = 'force-dynamic'
export default async function AdminPage() {
    if (!BETTER_AUTH_URL) {
        throw new Error("BETTER_AUTH_URL is not defined")
    }
    
    const headersList = await headers()
    let session;
    try {
        const headerEntries = Object.fromEntries(headersList.entries());
        // Create a proper Headers object
        const headersObj = new Headers(headerEntries)
        session = await auth.api.getSession({ headers: headersObj });
    } catch (error) {
        console.error("Failed to get session:", error);
        return <div className="p-8">Authentication error. Please try again later.</div>;
    }
    
    if (!session || !session.user || session.user.role !== "admin") {
        return <div className="p-8">You need admin privileges to access this page.</div>;
    }

    const allTodos = await db.query.todos.findMany({
        with: {
            user: {
                columns: {
                    name: true,
                }
            }
        },
        orderBy: [desc(todos.createdAt)]
    });

    return (
        <main className="py-8 px-4">
            <section className="container mx-auto">
                <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

                <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-muted">
                            <tr>
                                <th className="py-2 px-4 text-left">User</th>
                                <th className="py-2 px-4 text-left">Todo</th>
                                <th className="py-2 px-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allTodos.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="py-2 px-4 text-center">No todos found</td>
                                </tr>
                            )}
                            {allTodos.map((todo) => (
                                <tr key={todo.id} className="border-t">
                                    <td className="py-2 px-4">{todo.user?.name || 'Unknown'}</td>
                                    <td className="py-2 px-4">{todo.title}</td>
                                    <td className="py-2 px-4 text-center">
                                        <form action={async (formData) => {
                                            "use server"
                                            await deleteTodo(formData)
                                        }}>
                                            <input type="hidden" name="id" value={todo.id} />
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                type="submit"
                                            >
                                                Delete
                                            </Button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    )
}