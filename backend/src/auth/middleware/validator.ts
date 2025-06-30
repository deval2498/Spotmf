import { NextFunction } from "express";
import type { Request, Response } from "express";
import { actionTypeValidation, ethereumSignatureValidation, ethereumWalletValidation } from "../../shared/utils/Validations.ts";
import { CryptoService } from "../../shared/service/CryptoService.ts";
import { validateWalletAddress, validateRequestBody } from "../../shared/middleware/validator.ts";
const cryptoService = new CryptoService()


export const validateChallengeRequest = (req: Request, res: Response, next: NextFunction) => {
    if (!validateRequestBody(req, res)) return;
    
    const { walletAddress } = req.body;
    if (!validateWalletAddress(walletAddress, res)) return;
    
    next();
};

export const validateVerifyRequest = (req: Request, res: Response, next: NextFunction) => {
    if (!validateRequestBody(req, res)) return;
    
    const { walletAddress, signature } = req.body;
    
    if (!validateWalletAddress(walletAddress, res)) return;
    
    if (!signature) {
        res.status(400).json({
            error: 'Signature missing in request'
        });
        return;
    }
    
    if (!ethereumSignatureValidation(signature)) {
        res.status(400).json({
            error: "Invalid ethereum signature"
        });
        return;
    }
    
    next();
};

export const validateCreateActionRequest = (req: Request, res: Response, next: NextFunction) => {
    if (!validateRequestBody(req, res)) return;
    
    const { action } = req.body;

    if(!actionTypeValidation(action)) {
        res.status(400).json({
            error: "Invalid action type"
        })
        return
    }
    next();
};

export const validateVerifyActionRequest = (req: Request, res: Response, next: NextFunction) => {
    if (!validateRequestBody(req, res)) return;
    const { message, signature } = req.body;
    if(!message || !signature) {
        res.status(400).json({
            error: "Missing message or signature"
        })
        return
    }
    if (!ethereumSignatureValidation(signature)) {
        res.status(400).json({
            error: "Invalid ethereum signature"
        });
        return;
    }
    next()
}