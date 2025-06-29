import { NextFunction } from "express";
import "../types/express.d.ts"
import type { Request, Response } from "express";
import { actionTypeValidation, ethereumSignatureValidation, ethereumWalletValidation } from "../../shared/utils/Validations.ts";
import { CryptoService } from "../../shared/service/CryptoService.ts";

const cryptoService = new CryptoService()

// Helper function for common validation logic
const validateRequestBody = (req: Request, res: Response): boolean => {
    if (!req.body) {
        res.status(400).json({
            error: "Request body is required"
        });
        return false;
    }
    return true;
};

const validateWalletAddress = (walletAddress: any, res: Response): boolean => {
    if (!walletAddress) {
        res.status(400).json({
            error: 'Wallet address missing in request'
        });
        return false;
    }
    
    if (!ethereumWalletValidation(walletAddress)) {
        res.status(400).json({
            error: "Invalid ethereum address"
        });
        return false;
    }
    
    return true;
};

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
    
    const { action, actionData } = req.body;

    if(!actionTypeValidation(action)) {
        res.status(400).json({
            error: "Invalid action type"
        })
        return
    }

    if(!actionData) {
        res.status(400).json({
            error: "Action data not provided"
        })
        return
    }
    next();
};

export const validateJWT = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['Authorization'] as string
    if(!token) {
        res.status(401).json({
            error: "No token provided"
        })
        return
    }
    const payload = cryptoService.verifyJWT(token.substring(7)) || {}
    const { walletAddress } = payload;
    if(!validateWalletAddress(walletAddress, res)) {
        return
    }
    req.user = {
        walletAddress: walletAddress!
    }
    next()
}

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