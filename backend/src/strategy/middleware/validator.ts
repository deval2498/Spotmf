import { NextFunction } from "express";
import type { Request, Response } from "express";
import { validateRequestBody } from "../../shared/middleware/validator.ts";
import { body, param, query } from 'express-validator';

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


export const validateGetStrategiesQuery = [
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('cursor')
        .optional()
        .isString()
        .withMessage('Cursor must be a string'),
    query('userId')
        .optional()
        .isString()
        .withMessage('User ID must be a string')
];


export const validateStrategyId = [
    param('userStrategyId')
        .isString()
        .notEmpty()
        .withMessage('Strategy ID is required')
];
