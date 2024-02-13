import { z } from "zod";

export const todoSchema = z.object({
  id: z.string().uuid(),
  description: z.string().trim().min(3),
  completed: z.boolean(),
});
export type Todo = z.infer<typeof todoSchema>;

export const createTodoInput = todoSchema.pick({ description: true });
export type CreateTodoInput = z.infer<typeof createTodoInput>;

export const updateTodoInput = todoSchema.pick({ completed: true });
export type UpdateTodoInput = z.infer<typeof updateTodoInput>;
