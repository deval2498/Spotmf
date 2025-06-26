// src/auth/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.ts';
import { validateChallengeRequest, validateCreateActionRequest, validateJWT, validateVerifyActionRequest, validateVerifyRequest } from '../middleware/validator.ts';

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

  router.post('/create-action', validateCreateActionRequest, validateJWT, authController.createActionNonce.bind(authController));

  router.post('/verify-action', validateVerifyActionRequest, validateJWT, authController.verifyActionNonce.bind(authController));

  return router;
};