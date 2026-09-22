export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: { field: string; message: string }[];

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: { field: string; message: string }[],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
