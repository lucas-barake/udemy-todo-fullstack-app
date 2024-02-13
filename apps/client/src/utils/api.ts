import { type CreateTodoInput, type UpdateTodoInput, type Todo } from "@repo/shared";

const API_URL = "http://localhost:5000";

export const api = {
  getAllTodos: async (): Promise<Todo[]> => {
    const response = await fetch(API_URL);
    const json: unknown = await response.json();
    return json as Todo[];
  },

  deleteTodoById: async (id: string): Promise<void> => {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
  },

  deleteManyTodos: async (ids: Array<Todo["id"]>): Promise<void> => {
    await fetch(`${API_URL}/many`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ids),
    });
  },

  createTodo: async (input: CreateTodoInput): Promise<Todo> => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    const json: unknown = await response.json();
    return json as Todo;
  },

  updateTodo: async ({ id, ...input }: UpdateTodoInput & { id: string }): Promise<Todo> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    const json: unknown = await response.json();
    return json as Todo;
  },
};
