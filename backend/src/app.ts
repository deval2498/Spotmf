// src/app.ts
import express from 'express';
import cors from 'cors';
import { createMainRouter } from './routes';
import { errorHandler, notFoundHandler } from './shared/middleware/errorHandler';

export const createApp = (): express.Application => {
  const app = express();

  // Basic middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api', createMainRouter());

  // Error handling middleware (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};