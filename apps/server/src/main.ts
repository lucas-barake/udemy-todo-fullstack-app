import express, { type Application } from "express";
import cors from "cors";
import { errorHandlerMiddleware } from "$/common/middlewares/error-handler.middleware";
import { todosRouter } from "$/routers/todos/todos.router";

const app: Application = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    allowedHeaders: "*",
  })
);
app.use(express.json());

app.use("/todos", todosRouter);

app.use(errorHandlerMiddleware);

const PORT = 5000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
});
