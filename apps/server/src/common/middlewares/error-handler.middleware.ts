import { HttpStatus } from "$/common/enums/http-status.enum";
import { HttpError } from "$/common/exceptions/http-error.exception";
import { type NextFunction, type Request, type Response } from "express";
import { z } from "zod";

export function errorHandlerMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof z.ZodError) {
    res.status(HttpStatus.BAD_REQUEST).json({
      error: err.flatten(),
    });
    return;
  } else if (err instanceof HttpError) {
    res.status(err.code).json({
      message: err.message,
    });
    return;
  }
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    message: "Internal server error",
  });
}
