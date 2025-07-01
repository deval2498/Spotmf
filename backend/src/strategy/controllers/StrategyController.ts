import { UserStrategyService } from "../services/UserStrategyService.ts";
import type { Request, Response, NextFunction } from "express";

export class StrategyController {
    constructor( private strategyService: UserStrategyService) {
    }
    async storeSignedStrategyTxn(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this.strategyService.storeSignedStrategyTxn({...req.body, ...req.user});
            res.json(result)
        } catch (error) {
            next(error)
        }
    }

    // Updated method with pagination support
    async getAllUserStrategies(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { cursor, limit } = req.query;
            
            // Parse and validate limit
            const parsedLimit = limit ? parseInt(limit as string) : 10;
            if (parsedLimit < 1 || parsedLimit > 100) {
                res.status(400).json({ 
                    error: 'Limit must be between 1 and 100' 
                });
                return;
            }

            const result = await this.strategyService.getUserStrategies({
                cursor: cursor as string,
                limit: parsedLimit,
                ...req.user // Include authenticated user context
            });
            
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getUserStrategy(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userStrategyId } = req.params;
            
            if (!userStrategyId) {
                res.status(400).json({ 
                    error: 'Strategy ID is required' 
                });
                return;
            }

            const result = await this.strategyService.getUserStrategy({
                userStrategyId,
                ...req.user
            });
            
            if (!result) {
                res.status(404).json({ 
                    error: 'Strategy not found' 
                });
                return;
            }
            
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}