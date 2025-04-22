"use server"

import { eq, and } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { todos } from "@/database/schema"

export async function createTodo(formData: FormData) {
    const headersList = headers()
    const session = await auth.api.getSession({ headers: headersList })
    if (!session?.user) {
        return { error: "You must be signed in to create todos" }
    }
    const title = formData.get("title") as string
    if (!title || title.trim() === "") {
        return { error: "Title cannot be empty" }
    }
    
    try {
        await db.insert(todos).values({
            title: title.trim(),
            userId: session.user.id,
            completed: false
        })
        revalidatePath("/todos")
        
        return { success: true }
    } catch (error) {
        console.error("Error creating todo:", error)
        return { error: "Failed to create todo. Please try again." }
    }
}

export async function toggleTodo(formData: FormData) {
    const headersList = headers()
    const session = await auth.api.getSession({ headers: headersList })
    if (!session?.user) {
        return { error: "You must be signed in to update todos" }
    }
    const id = formData.get("id") as string
    if (!id) {
        return { error: "Todo ID is required" }
    }
    
    try {
        const [todo] = await db
            .select()
            .from(todos)
            .where(
                and(
                    eq(todos.id, id),
                    eq(todos.userId, session.user.id) 
                )
            )
        
        if (!todo) {
            return { error: "Todo not found or you don't have permission to update it" }
        }
        await db
            .update(todos)
            .set({ 
                completed: !todo.completed,
                updatedAt: new Date()
            })
            .where(eq(todos.id, id))
        revalidatePath("/todos")
        
        return { success: true }
    } catch (error) {
        console.error("Error toggling todo:", error)
        return { error: "Failed to update todo. Please try again." }
    }
}

export async function deleteTodo(formData: FormData) {
    const headersList = headers()
    const session = await auth.api.getSession({ headers: headersList })
    if (!session?.user) {
        return { error: "You must be signed in to delete todos" }
    }
    if (session.user.role !== "admin") {
        return { error: "Only administrators can delete todos" }
    }
    const id = formData.get("id") as string
    if (!id) {
        return { error: "Todo ID is required" }
    }
    
    try {
        await db.delete(todos)
            .where(eq(todos.id, id));
        revalidatePath("/admin");
        revalidatePath("/todos");
        
        return { success: true }
    } catch (error) {
        console.error("Error deleting todo:", error)
        return { error: "Failed to delete todo. Please try again." }
    }
}