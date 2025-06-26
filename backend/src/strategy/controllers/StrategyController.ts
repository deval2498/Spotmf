import { UserStrategyService } from "../services/UserStrategyService.ts";
import type { Request, Response, NextFunction } from "express";

export class StrategyController {
    constructor( private strategyService: UserStrategyService) {
    }
    async storeSignedStrategyTxn(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this.strategyService.storeSignedStrategyTxn(req.body);
            res.json(result)
        } catch (error) {
            next(error)
        }
    }
}