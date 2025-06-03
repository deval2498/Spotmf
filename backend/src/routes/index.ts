// src/routes/index.ts
import { Router } from 'express';
import { createAuthRoutes } from '../auth/routes/auth.routes.js';
import { AuthController } from '../auth/controllers/AuthController.js';
import { WalletAuthService } from '../auth/services/WalletAuthService.js';
import { CryptoService } from '../shared/service/CryptoService.js';
import { db } from '../shared/config/Database.js';

export const createMainRouter = (): Router => {
  const router = Router();

  // Initialize services
  const cryptoService = new CryptoService();
  const prisma = db.getClient();
  const authService = new WalletAuthService(prisma, cryptoService);
  const authController = new AuthController(authService);

  // Register route modules
  router.use('/auth', createAuthRoutes(authController));

  return router;
};