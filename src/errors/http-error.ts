// first is only coorect from line no 3-10

export class HttpError extends Error {
    statusCode: number;
  
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
    }
  }
  

export class BadRequestError extends HttpError {
    constructor(message: string = 'Bad Request') {
      super(message, 400);
    }
  }
  
  export class UnauthorizedError extends HttpError {
    constructor(message: string = 'Unauthorized') {
      super(message, 401);
    }
  }
  
  export class ForbiddenError extends HttpError {
    constructor(message: string = 'Forbidden') {
      super(message, 403);
    }
  }
  
  export class NotFoundError extends HttpError {
    constructor(message: string = 'Not Found') {
      super(message, 404);
    }
  }
  
  export class InternalServerError extends HttpError {
    constructor(message: string = 'Internal Server Error') {
      super(message, 500);
    }
  }