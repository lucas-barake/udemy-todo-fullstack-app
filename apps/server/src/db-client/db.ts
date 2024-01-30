import { todoSchema, type Todo } from "@repo/shared";
import { z } from "zod";
import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { HttpError } from "$/common/exceptions/http-error.exception";
import { HttpStatus } from "$/common/enums/http-status.enum";

type ReadJsonResult = { success: true; todos: Todo[] } | { success: false; error: Error };
type CreateArgs = Omit<Todo, "id">;
type FindUniqueArgs = {
  id: Todo["id"];
};
type UpdateArgs = {
  id: Todo["id"];
  data: Partial<Omit<Todo, "id">>;
};
type DeleteArgs = {
  id: Todo["id"];
};
type DeleteManyArgs =
  | {
      ids: Array<Todo["id"]>;
    }
  | {
      clearAll: true;
    };

export class Db {
  constructor(private readonly filePath: string = "./store.json") {}

  private async readJson(): Promise<ReadJsonResult> {
    try {
      const data = await fs.readFile(path.join(__dirname, this.filePath), "utf-8");
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
        console.error(`File not found at ${this.filePath}`);
        return { success: false, error: new Error(`File not found at ${this.filePath}`) };
      } else if (error instanceof SyntaxError) {
        console.error(`Invalid JSON in file ${this.filePath}`);
        return {
          success: false,
          error: new Error(`Invalid JSON in file ${this.filePath} ${error.message}`),
        };
      } else if (error instanceof z.ZodError) {
        console.error(`Invalid data in file ${this.filePath}`);
        return { success: false, error: new Error(`Invalid data in file ${this.filePath}`) };
      }

      console.error("Unknown error", error);
      return { success: false, error: error instanceof Error ? error : new Error("Unknown error") };
    }
  }

  private async writeJson(todos: Todo[]): Promise<void> {
    try {
      await fs.writeFile(path.join(__dirname, this.filePath), JSON.stringify(todos));
    } catch (error: unknown) {
      console.error("Error writing to file", error);
    }
  }

  public async create(args: CreateArgs): Promise<Todo> {
    const newTodo = {
      ...args,
      id: uuidv4(),
    } satisfies Todo;
    const readResult = await this.readJson();
    if (!readResult.success)
      throw new HttpError({
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Error in creating todo.",
      });
    readResult.todos.push(newTodo);
    await this.writeJson(readResult.todos);
    return newTodo;
  }

  public async findUnique(args: FindUniqueArgs): Promise<Todo | null> {
    const readResult = await this.readJson();
    if (!readResult.success)
      throw new HttpError({
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Error in finding todo by id.",
      });
    const foundTodo = readResult.todos.find((todo) => todo.id === args.id);
    return foundTodo ?? null;
  }

  public async update(args: UpdateArgs): Promise<Todo | null> {
    const readResult = await this.readJson();
    if (!readResult.success)
      throw new HttpError({
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Error in updating todo.",
      });
    const foundIndex = readResult.todos.findIndex((todo) => todo.id === args.id);
    if (foundIndex === -1) return null;

    const updatedTodo = {
      ...readResult.todos[foundIndex],
      ...args.data,
    } satisfies Todo;
    readResult.todos[foundIndex] = updatedTodo;
    await this.writeJson(readResult.todos);
    return updatedTodo;
  }

  public async delete(args: DeleteArgs): Promise<void> {
    const readResult = await this.readJson();
    if (!readResult.success)
      throw new HttpError({
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Error in deleting todo.",
      });
    const todoIndex = readResult.todos.findIndex((todo) => todo.id === args.id);
    if (todoIndex === -1) return;

    readResult.todos.splice(todoIndex, 1);
    await this.writeJson(readResult.todos);
  }

  public async deleteMany(args: DeleteManyArgs): Promise<void> {
    const readResult = await this.readJson();
    if (!readResult.success)
      throw new HttpError({
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Error in deleting todos.",
      });
    if ("clearAll" in args) {
      await this.writeJson([]);
      return;
    }

    const newTodos = readResult.todos.filter((todo) => !args.ids.includes(todo.id));
    await this.writeJson(newTodos);
  }
}

export const db = new Db();
