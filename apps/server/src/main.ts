import express, { type Request, type Response, type Application } from "express";
import cors from "cors";

const app: Application = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    allowedHeaders: "*",
  })
);
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello World!");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
