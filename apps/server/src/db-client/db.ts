import { todoSchema, type Todo } from "@repo/shared";
import { z } from "zod";
import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";

const FILE_PATH = "./db.json";

type ReadJsonResult = { success: true; todos: Todo[] } | { success: false; error: Error };
async function readJson(): Promise<ReadJsonResult> {
  try {
    const data = await fs.readFile(FILE_PATH, "utf-8");
    const deserializedData: unknown = JSON.parse(data);
    const schema = z.array(todoSchema);
    const parsedData = schema.parse(deserializedData);
    return { success: true, todos: parsedData };
  } catch (error: unknown) {
    const notFoundError = z
      .object({
        code: z.literal("ENOENT"),
      })
      .safeParse(error);
    if (notFoundError.success) {
      console.error(`File not found at ${FILE_PATH}`);
      return { success: false, error: new Error(`File not found at ${FILE_PATH}`) };
    } else if (error instanceof SyntaxError) {
      console.error(`Invalid JSON in file ${FILE_PATH}`);
      return { success: false, error: new Error(`Invalid JSON in file ${FILE_PATH}`) };
    } else if (error instanceof z.ZodError) {
      console.error(`Invalid data in file ${FILE_PATH}`);
      return { success: false, error: new Error(`Invalid data in file ${FILE_PATH}`) };
    }

    console.error("Unknown error", error);
    return { success: false, error: error instanceof Error ? error : new Error("Unknown error") };
  }
}

async function writeJson(todos: Todo[]): Promise<void> {
  try {
    await fs.writeFile(FILE_PATH, JSON.stringify(todos));
  } catch (error: unknown) {
    console.error("Error writing to file", error);
  }
}

type CreateArgs = Omit<Todo, "id">;
async function create(args: CreateArgs): Promise<Todo> {
  const newTodo = {
    ...args,
    id: uuidv4(),
  } satisfies Todo;
  const readResult = await readJson();
  if (!readResult.success) throw new Error(`Error in create: ${readResult.error.message}`);
  readResult.todos.push(newTodo);
  await writeJson(readResult.todos);
  return newTodo;
}

type FindUniqueArgs = {
  id: Todo["id"];
};
async function findUnique(args: FindUniqueArgs): Promise<Todo | null> {
  const readResult = await readJson();
  if (!readResult.success) throw new Error(`Error in findUnique: ${readResult.error.message}`);
  const foundTodo = readResult.todos.find((todo) => todo.id === args.id);
  return foundTodo ?? null;
}

type UpdateArgs = {
  id: Todo["id"];
  data: Partial<Omit<Todo, "id">>;
};
async function update(args: UpdateArgs): Promise<Todo | null> {
  const readResult = await readJson();
  if (!readResult.success) throw new Error(`Error in update: ${readResult.error.message}`);
  const foundIndex = readResult.todos.findIndex((todo) => todo.id === args.id);
  if (foundIndex === -1) return null;

  const updatedTodo = {
    ...readResult.todos[foundIndex],
    ...args.data,
  } satisfies Todo;
  readResult.todos[foundIndex] = updatedTodo;
  await writeJson(readResult.todos);
  return updatedTodo;
}

type DeleteArgs = {
  id: Todo["id"];
};
async function deleteTodo(args: DeleteArgs): Promise<void> {
  const readResult = await readJson();
  if (!readResult.success) throw new Error(`Error in deleteTodo: ${readResult.error.message}`);
  const todoIndex = readResult.todos.findIndex((todo) => todo.id === args.id);
  if (todoIndex === -1) return;

  readResult.todos.splice(todoIndex, 1);
  await writeJson(readResult.todos);
}

type DeleteManyArgs =
  | {
      ids: Array<Todo["id"]>;
    }
  | {
      clearAll: true;
    };
async function deleteMany(args: DeleteManyArgs): Promise<void> {
  const readResult = await readJson();
  if (!readResult.success) throw new Error(`Error in deleteMany: ${readResult.error.message}`);
  if ("clearAll" in args) {
    await writeJson([]);
    return;
  }

  const newTodos = readResult.todos.filter((todo) => !args.ids.includes(todo.id));
  await writeJson(newTodos);
}

export const db = {
  create,
  findUnique,
  update,
  delete: deleteTodo,
  deleteMany,
};
