import { expect, test, beforeEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import { Db } from "$/db-client/db";

const TEST_FILE_PATH = "./store.test.json";
const db = new Db(TEST_FILE_PATH);

async function resetTestFile(): Promise<void> {
  const filePath = path.join(__dirname, TEST_FILE_PATH);
  await fs.writeFile(filePath, JSON.stringify([]));
}

beforeEach(resetTestFile);

test("create", async () => {
  const title = "Test todo";
  const newTodo = await db.create({ title, completed: false });

  expect(newTodo.title).toBe(title);
  expect(newTodo).toHaveProperty("completed", false);
});

test("findUnique", async () => {
  const newTodo = await db.create({ title: "Test todo", completed: false });
  const foundTodo = await db.findUnique({ id: newTodo.id });
  expect(foundTodo).toEqual(newTodo);
});

test("update", async () => {
  const newTodo = await db.create({ title: "Test todo", completed: false });
  const updatedTodo = await db.update({ id: newTodo.id, data: { completed: true } });
  expect(updatedTodo?.completed).toBe(true);
});

test("delete", async () => {
  const newTodo = await db.create({ title: "Test todo", completed: false });
  await db.delete({ id: newTodo.id });
  const foundTodo = await db.findUnique({ id: newTodo.id });
  expect(foundTodo).toBe(null);
});

test("deleteMany", async () => {
  const createdTodos = await Promise.all([
    db.create({ title: "Test todo 1", completed: false }),
    db.create({ title: "Test todo 2", completed: false }),
    db.create({ title: "Test todo 3", completed: false }),
  ]);
  await db.deleteMany({ ids: createdTodos.map((todo) => todo.id) });
  const foundTodos = await Promise.all(createdTodos.map((todo) => db.findUnique({ id: todo.id })));
  expect(foundTodos).toEqual([null, null, null]);
});

test("deleteMany with clearAll", async () => {
  const createdTodos = await Promise.all([
    db.create({ title: "Test todo 1", completed: false }),
    db.create({ title: "Test todo 2", completed: false }),
    db.create({ title: "Test todo 3", completed: false }),
  ]);
  await db.deleteMany({ clearAll: true });
  const foundTodos = await Promise.all(createdTodos.map((todo) => db.findUnique({ id: todo.id })));
  expect(foundTodos).toEqual([null, null, null]);
});
