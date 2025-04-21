"use client"

import { useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { useOptimistic } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createTodo } from "@/actions/todos"
import { Todo } from "@/database/schema"
import { TodoItem } from "./TodoItem"

export function TodoList({ todos }: { todos: Todo[] }) {
    const formRef = useRef<HTMLFormElement>(null)
    const [error, setError] = useState<string | null>(null)
    
    const [optimisticTodos, addOptimisticTodo] = useOptimistic(
        todos,
        (state, newTodo: Partial<Todo>) => {
            return [
                {
                    id: crypto.randomUUID(),
                    title: newTodo.title || "",
                    completed: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    userId: newTodo.userId || "",
                    ...newTodo
                } as Todo,
                ...state,
            ]
        }
    )
    
    async function handleSubmit(formData: FormData) {
        const title = formData.get("title") as string
        if (!title?.trim()) {
            setError("Title cannot be empty")
            return
        }
        
        setError(null)
        addOptimisticTodo({ title })
        formRef.current?.reset()
        
        const result = await createTodo(formData)
        if (!result.success) {
            setError(result.error || "Failed to create todo")
        }
    }
    
    return (
        <div className="space-y-4">
            <form ref={formRef} action={handleSubmit} className="flex gap-2 items-stretch">
                <div className="flex-1">
                    <Input
                        name="title"
                        placeholder="Add a new todo..."
                        aria-invalid={error ? "true" : "false"}
                        className={error ? "border-red-500" : ""}
                    />
                    {error && (
                        <div className="text-sm text-red-500 mt-1">
                            {error}
                        </div>
                    )}
                </div>
                <SubmitButton />
            </form>

            <ul className="space-y-2">
                {optimisticTodos.length === 0 ? (
                    <li className="text-center py-4 text-muted-foreground">
                        No todos yet. Add one above!
                    </li>
                ) : (
                    optimisticTodos.map((todo) => (
                        <TodoItem key={todo.id} todo={todo} />
                    ))
                )}
            </ul>
        </div>
    )
}

function SubmitButton() {
    const { pending } = useFormStatus()
    
    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Adding..." : "Add"}
        </Button>
    )
}