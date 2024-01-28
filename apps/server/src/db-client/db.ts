import { todoSchema, type Todo } from "@repo/shared";
import { z } from "zod";
import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";
const FILE_PATH = "./db.json";

async function readJson(): Promise<Todo[]> {
  try {
    const data = await fs.readFile(FILE_PATH, "utf-8");
    const deserializedData: unknown = JSON.parse(data);
    const schema = z.array(todoSchema);
    const parsedData = schema.parse(deserializedData);
    return parsedData;
  } catch (error: unknown) {
    const notFoundError = z
      .object({
        code: z.literal("ENOENT"),
      })
      .safeParse(error);
    if (notFoundError.success) {
      console.error(`File not found at ${FILE_PATH}`);
      return [];
    } else if (error instanceof SyntaxError) {
      console.error(`Invalid JSON in file ${FILE_PATH}`);
      // TODO: Re-initialize the file
      return [];
    } else if (error instanceof z.ZodError) {
      console.error(`Invalid data in file ${FILE_PATH}`);
      // TODO: Re-initialize the file
      return [];
    } else {
      console.error("Unknown error", error);
      return [];
    }
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
  const storedTodos = await readJson();
  storedTodos.push(newTodo);
  await writeJson(storedTodos);
  return newTodo;
}

type FindUniqueArgs = {
  id: Todo["id"];
};
async function findUnique(args: FindUniqueArgs): Promise<Todo | null> {
  const storedTodos = await readJson();
  const foundTodo = storedTodos.find((todo) => todo.id === args.id);
  return foundTodo ?? null;
}

type UpdateArgs = {
  id: Todo["id"];
  data: Partial<Omit<Todo, "id">>;
};
async function update(args: UpdateArgs): Promise<Todo | null> {
  const storedTodos = await readJson();
  const foundIndex = storedTodos.findIndex((todo) => todo.id === args.id);
  if (foundIndex === -1) return null;

  const updatedTodo = {
    ...storedTodos[foundIndex],
    ...args.data,
  } satisfies Todo;
  storedTodos[foundIndex] = updatedTodo;
  await writeJson(storedTodos);
  return updatedTodo;
}

type DeleteArgs = {
  id: Todo["id"];
};
async function deleteTodo(args: DeleteArgs): Promise<boolean> {
  const storedTodos = await readJson();
  const todoIndex = storedTodos.findIndex((todo) => todo.id === args.id);
  if (todoIndex === -1) return false;

  storedTodos.splice(todoIndex, 1);
  await writeJson(storedTodos);
  return true;
}

type DeleteManyArgs =
  | {
      ids: Array<Todo["id"]>;
    }
  | {
      clearAll: true;
    };
async function deleteMany(args: DeleteManyArgs): Promise<boolean> {
  const storedTodos = await readJson();
  if ("clearAll" in args) {
    await writeJson([]);
    return true;
  }

  const newTodos = storedTodos.filter((todo) => !args.ids.includes(todo.id));
  await writeJson(newTodos);
  return true;
}

export const db = {
  create,
  findUnique,
  update,
  delete: deleteTodo,
  deleteMany,
};
