export abstract class BaseException extends Error {
  abstract readonly statusCode: number

  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class AuthException extends BaseException {
  readonly statusCode = 401

  constructor(message: string) {
    super(message)
  }
}

export class ServerError extends BaseException {
  readonly statusCode = 500

  constructor(message = 'Internal server error') {
    super(message)
  }
}

export class NotFoundError extends BaseException {
  readonly statusCode = 404

  constructor(message: string) {
    super(message)
  }
}

export class ValidationError extends BaseException {
  readonly statusCode = 400

  constructor(message: string) {
    super(message)
  }
}
