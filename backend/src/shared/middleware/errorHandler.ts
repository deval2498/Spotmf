// src/shared/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { BaseException } from '../../shared/exceptions/Exceptions.ts';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Handle our custom exceptions
  if (error instanceof BaseException) {
    res.status(error.statusCode).json({
      error: error.message
    });
    return;
  }

  // Handle unexpected errors
  console.error('Unexpected error:', error);
  res.status(500).json({
    error: 'Internal server error'
  });
};

// Route not found handler
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: `Route ${req.method} ${req.path} not found`
  });
};