"use client"

import { useState } from "react"
import { Todo } from "@/database/schema"
import { Checkbox } from "@/components/ui/checkbox"
import { toggleTodo } from "@/actions/todos"

export function TodoItem({ todo }: { todo: Todo }) {
    const [isChecked, setIsChecked] = useState(todo.completed)
    const [isPending, setIsPending] = useState(false)
    const handleToggle = async () => {
        if (isPending) return
        setIsChecked(!isChecked)
        setIsPending(true)
        try {
            const formData = new FormData()
            formData.append("id", todo.id)
            await toggleTodo(formData)
        } catch (error) {
            console.error("Failed to toggle todo:", error)
            setIsChecked(isChecked)
        } finally {
            setIsPending(false)
        }
    }

    return (
        <li
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 ${
                isPending ? "opacity-70" : ""
            }`}
        >
            <Checkbox
                checked={isChecked}
                onCheckedChange={handleToggle}
                disabled={isPending}
            />
            <span 
                className={`flex-1 ${
                    isChecked ? "line-through text-muted-foreground" : ""
                }`}
            >
                {todo.title}
            </span>
        </li>
    )
}