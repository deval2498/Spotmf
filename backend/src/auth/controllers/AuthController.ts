import { WalletAuthService } from "../services/WalletAuthService.ts";
import type { Request, Response, NextFunction } from "express";
export class AuthController {
    constructor(private authService: WalletAuthService) {
    }

    async generateChallenge(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
          const result = await this.authService.generateChallenge(req.body);
          res.json(result);
        } catch (error) {
          next(error);
        }
      }

      async verifySignature(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
          const result = await this.authService.verifyAndLogin(req.body);
          res.json(result);
        } catch (error) {
          next(error);
        }
      }

      async createActionNonce(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
          const result = await this.authService.createActionNonce({...req.body, ...req.user});
          res.json(result);
        } catch (error) {
          next(error)
        }
      }

      async verifyActionNonce(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
          const result = await this.authService.verifyActionNonce({...req.body, ...req.user});
          res.json(result)
        } catch (error) {
          next(error)
        }
      }
}