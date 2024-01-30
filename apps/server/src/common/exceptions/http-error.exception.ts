import { type HttpStatus } from "$/common/enums/http-status.enum";

export class HttpError extends Error {
  public readonly code;

  constructor(opts: { message: string; code: HttpStatus }) {
    super(opts.message);
    this.code = opts.code;
    this.name = HttpError.name;
  }
}
