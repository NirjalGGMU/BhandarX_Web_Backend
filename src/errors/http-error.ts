// first is only coorect from line no 3-10

export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
      super(message);
      this.statusCode = statusCode;
      this.name = 'HttpError';
      
      // Maintains proper stack trace for where our error was thrown (only available on V8)
      if (Error.captureStackTrace) {
          Error.captureStackTrace(this, HttpError);
      }
      
      // Fix for prototype chain
      Object.setPrototypeOf(this, new.target.prototype);
  }
}
