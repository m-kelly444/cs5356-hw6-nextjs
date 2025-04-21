"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { todos, insertTodoSchema } from "@/database/schema"
import { ZodError } from "zod"
import { headers } from "next/headers"

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL

export async function createTodo(formData: FormData) {
    if (!BETTER_AUTH_URL) {
        throw new Error("BETTER_AUTH_URL is not defined")
    }
    
    try {
        const headersList = await headers()
        const sessionResponse = await auth.handler(new Request(BETTER_AUTH_URL, { 
            headers: Object.fromEntries(headersList.entries())
        }))
        const session = await sessionResponse.json()
        
        if (!session) {
            return { success: false, error: "You must be logged in" }
        }
        
        const title = formData.get("title")
        if (typeof title !== "string") {
            return { success: false, error: "Invalid title format" }
        }
        
        const validatedData = insertTodoSchema.parse({
            title: title.trim(),
            userId: session.user.id,
        })
        
        await db.insert(todos).values({
            title: validatedData.title,
            userId: session.user.id,
        })
        
        revalidatePath("/todos")
        return { success: true }
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: error.errors[0]?.message || "Validation failed" }
        }
        return { success: false, error: "Failed to create todo" }
    }
}

export async function toggleTodo(id: string) {
    if (!BETTER_AUTH_URL) {
        throw new Error("BETTER_AUTH_URL is not defined")
    }
    
    try {
        if (!id) {
            return { success: false, error: "Missing todo ID" }
        }
        
        const headersList = await headers()
        const sessionResponse = await auth.handler(new Request(BETTER_AUTH_URL, { 
            headers: Object.fromEntries(headersList.entries())
        }))
        const session = await sessionResponse.json()
        
        if (!session) {
            return { success: false, error: "You must be logged in" }
        }
        
        const todo = await db.query.todos.findFirst({
            where: eq(todos.id, id)
        })
        
        if (!todo) {
            return { success: false, error: "Todo not found" }
        }
        
        if (todo.userId !== session.user.id) {
            return { success: false, error: "You can only toggle your own todos" }
        }
        
        await db.update(todos)
            .set({ 
                completed: !todo.completed,
                updatedAt: new Date()
            })
            .where(eq(todos.id, id))
        
        revalidatePath("/todos")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to toggle todo" }
    }
}

export async function deleteTodo(formData: FormData) {
    if (!BETTER_AUTH_URL) {
        throw new Error("BETTER_AUTH_URL is not defined")
    }
    
    try {
        const headersList = await headers()
        const sessionResponse = await auth.handler(new Request(BETTER_AUTH_URL, { 
            headers: Object.fromEntries(headersList.entries())
        }))
        const session = await sessionResponse.json()
        
        if (!session) {
            return { success: false, error: "You must be logged in" }
        }
        
        if (session.user.role !== "admin") {
            return { success: false, error: "Only admins can delete todos" }
        }
        
        const id = formData.get("id")
        if (typeof id !== "string" || !id) {
            return { success: false, error: "Invalid todo ID" }
        }
        
        await db.delete(todos).where(eq(todos.id, id))
        
        revalidatePath("/admin")
        revalidatePath("/todos")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete todo" }
    }
}