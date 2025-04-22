"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createTodo } from "@/actions/todos"
import { Todo } from "@/database/schema"
import { TodoItem } from "./TodoItem"
import { useRouter } from "next/navigation"

export function TodoList({ todos: initialTodos }: { todos: Todo[] }) {
    const [title, setTitle] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()
    const [optimisticTodos, setOptimisticTodos] = useState<Todo[]>(initialTodos)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!title.trim()) {
            setError("Title cannot be empty")
            return
        }
        
        setIsSubmitting(true)
        setError(null)
        const optimisticTodo: Todo = {
            id: `temp-${Date.now()}`,
            title,
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: "current-user"
        }
        setOptimisticTodos(prev => [optimisticTodo, ...prev])
        
        try {
            const formData = new FormData()
            formData.append("title", title)
            const result = await createTodo(formData)
            
            if (result?.error) {
                setError(result.error)
                setOptimisticTodos(prev => prev.filter(t => t.id !== optimisticTodo.id))
            } else {
                setTitle("")
                router.refresh()
            }
        } catch (err) {
            console.error("Error creating todo:", err)
            setError("Failed to create todo")
            setOptimisticTodos(prev => prev.filter(t => t.id !== optimisticTodo.id))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="flex gap-2 items-stretch">
                <Input
                    name="title"
                    placeholder="Add a new todo..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={error ? "border-red-500" : ""}
                />
                <Button 
                    type="submit"
                    disabled={isSubmitting || !title.trim()}
                >
                    {isSubmitting ? "Adding..." : "Add"}
                </Button>
            </form>
            
            {/* Validation Error */}
            {error && (
                <p className="text-red-500 text-sm">{error}</p>
            )}

            <ul className="space-y-2">
                {optimisticTodos.map((todo) => (
                    <TodoItem key={todo.id} todo={todo} />
                ))}
                
                {optimisticTodos.length === 0 && (
                    <li className="text-muted-foreground text-center py-4">
                        No todos yet. Add one above!
                    </li>
                )}
            </ul>
        </div>
    )
}