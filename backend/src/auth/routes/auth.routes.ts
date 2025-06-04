// src/auth/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateChallengeRequest, validateVerifyRequest } from '../middleware/validator';

export const createAuthRoutes = (authController: AuthController): Router => {
  const router = Router();

  // POST /auth/challenge
  router.post(
    '/challenge',
    validateChallengeRequest,
    authController.generateChallenge.bind(authController)
  );

  // POST /auth/verify
  router.post(
    '/verify',
    validateVerifyRequest,
    authController.verifySignature.bind(authController)
  );

  return router;
};