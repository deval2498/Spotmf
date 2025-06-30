import { NextFunction } from "express";
import type { Request, Response } from "express";
import { validateRequestBody } from "../../shared/middleware/validator.ts";

export const validateStoreStrategyRequest = (req: Request, res: Response, next: NextFunction) => {
    if (!validateRequestBody(req, res)) return;

    const { txHash, actionId } = req.body;

    if(!txHash || !actionId) {
        res.status(400).json({
            error: "txHas and action id are required"
        })
        return
    }

    next()
}