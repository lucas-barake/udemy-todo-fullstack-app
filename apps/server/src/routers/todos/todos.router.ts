import { createTodoInput, updateTodoInput, todoSchema } from "@repo/shared";
import express, { type Request, type Response } from "express";
import { z } from "zod";

export const todosRouter = express.Router();

todosRouter.get("/", (req: Request, res: Response) => {
  res.send([]);
});

todosRouter.delete("/:id", (req: Request, res: Response) => {
  const todoId = todoSchema.shape.id.parse(req.params.id);
  res.send(todoId);
});

todosRouter.post("/", (req: Request, res: Response) => {
  const input = createTodoInput.parse(req.body);
  res.json(input);
});

todosRouter.patch("/:id", (req: Request, res: Response) => {
  const todoId = todoSchema.shape.id.parse(req.params.id);
  const input = updateTodoInput.parse(req.body);
  res.json({ todoId, ...input });
});

todosRouter.delete("/many", (req: Request, res: Response) => {
  const ids = z.array(todoSchema.shape.id).parse(req.body);
  res.send(ids);
});
