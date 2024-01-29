import { test, expect, beforeEach } from "vitest";
import { Db } from "./db";
import { promises as fs } from "fs";
import path from "path";

const TEST_FILE_PATH = "./test_db.json";
const testDb = new Db(TEST_FILE_PATH);

async function resetTestFile(): Promise<void> {
  const filePath = path.join(__dirname, TEST_FILE_PATH);
  await fs.writeFile(filePath, JSON.stringify([]));
}

beforeEach(async () => {
  await resetTestFile();
});

test("create", async () => {
  const title = "Test Todo";
  const newTodo = await testDb.create({ title, completed: false });

  expect(newTodo).toHaveProperty("title", title);
  expect(newTodo).toHaveProperty("completed", false);
});

test("findUnique", async () => {
  const newTodo = await testDb.create({ title: "Test Todo", completed: false });
  const foundTodo = await testDb.findUnique({ id: newTodo.id });
  expect(foundTodo).toEqual(newTodo);
});

test("update", async () => {
  await resetTestFile();
  const newTodo = await testDb.create({ title: "Test Todo", completed: false });
  const updatedTodo = await testDb.update({ id: newTodo.id, data: { completed: true } });
  expect(updatedTodo?.completed).toBe(true);
});

test("deleteTodo", async () => {
  await resetTestFile();
  const newTodo = await testDb.create({ title: "Test Todo", completed: false });
  await testDb.delete({ id: newTodo.id });

  const todo = await testDb.findUnique({ id: newTodo.id });
  expect(todo).toBe(null);
});

test("deleteMany", async () => {
  await resetTestFile();
  const newTodo1 = await testDb.create({ title: "Test Todo 1", completed: false });
  const newTodo2 = await testDb.create({ title: "Test Todo 2", completed: false });
  await testDb.deleteMany({ ids: [newTodo1.id, newTodo2.id] });

  const todo1 = await testDb.findUnique({ id: newTodo1.id });
  const todo2 = await testDb.findUnique({ id: newTodo2.id });
  expect(todo1).toBe(null);
  expect(todo2).toBe(null);
});
