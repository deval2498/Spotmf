// src/routes/index.ts
import { Router } from 'express';
import { createAuthRoutes } from '../auth/routes/auth.routes.ts';
import { AuthController } from '../auth/controllers/AuthController.ts';
import { WalletAuthService } from '../auth/services/WalletAuthService.ts';
import { CryptoService } from '../shared/service/CryptoService.ts';
import { db } from '../shared/config/Database.ts';
import { StrategyController } from '../strategy/controllers/StrategyController.ts';
import { UserStrategyService } from '../strategy/services/UserStrategyService.ts';
import { createStrategyRouter } from '../strategy/routes/strategy.routes.ts';

export const createMainRouter = (): Router => {
  const router = Router();

  // Initialize services
  const cryptoService = new CryptoService();
  const prisma = db.getClient();
  const authService = new WalletAuthService(prisma, cryptoService);
  const authController = new AuthController(authService);
  const strategyService = new UserStrategyService(prisma)
  const strategyController = new StrategyController(strategyService)

  // Register route modules
  router.use('/auth', createAuthRoutes(authController));

  router.use('/strategy', createStrategyRouter(strategyController))

  return router;
};