"use client"

import { useState } from "react"
import { Todo } from "@/database/schema"
import { Checkbox } from "@/components/ui/checkbox"
import { toggleTodo } from "@/actions/todos"

export function TodoItem({ todo }: { todo: Todo }) {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleToggle() {
        try {
            setIsPending(true)
            setError(null)
            
            const result = await toggleTodo(todo.id)
            
            if (!result.success) {
                setError(result.error || "Failed to toggle todo")
            }
        } catch (e) {
            setError("An unexpected error occurred")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <li
            key={todo.id}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 ${isPending ? "opacity-50" : ""}`}
        >
            <Checkbox
                checked={todo.completed}
                onCheckedChange={handleToggle}
                disabled={isPending}
            />
            <span className={`flex-1 ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                {todo.title}
            </span>
            {error && (
                <span className="text-xs text-red-500">{error}</span>
            )}
        </li>
    )
}