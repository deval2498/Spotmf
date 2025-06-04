import { NextFunction } from "express";
import type { Request, Response } from "express";
import { ethereumSignatureValidation, ethereumWalletValidation } from "@/shared/utils/Validations";

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