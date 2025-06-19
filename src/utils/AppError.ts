//Custom error class
export default class AppError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;

    // Ensure the name of this error is the class name
    this.name = this.constructor.name;

    // Captures stack trace (helpful in debugging)
    Error.captureStackTrace(this, this.constructor);
  }
}