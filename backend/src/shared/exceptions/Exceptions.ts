// src/shared/exceptions/BaseException.ts
export abstract class BaseException extends Error {
    abstract readonly statusCode: number;
  
    constructor(message: string) {
      super(message);
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  // src/shared/exceptions/AuthException.ts
  export class AuthException extends BaseException {
    readonly statusCode = 401;
  
    constructor(message: string) {
      super(message);
    }
  }
  
  // src/shared/exceptions/ServerError.ts
  export class ServerError extends BaseException {
    readonly statusCode = 500;
  
    constructor(message: string = 'Internal server error') {
      super(message);
    }
  }
  
  // src/shared/exceptions/NotFoundError.ts
  export class NotFoundError extends BaseException {
    readonly statusCode = 404;
  
    constructor(message: string) {
      super(message);
    }
  }
  