import { NextFunction } from "express";
import "../types/express.d.ts"
import type { Request, Response } from "express";
import { CryptoService } from "../../shared/service/CryptoService.ts";
import { actionTypeValidation, ethereumSignatureValidation, ethereumWalletValidation } from "../../shared/utils/Validations.ts";
const cryptoService = new CryptoService();


export const validateWalletAddress = (walletAddress: any, res: Response): boolean => {
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

// Helper function for common validation logic
export const validateRequestBody = (req: Request, res: Response): boolean => {
    if (!req.body) {
        res.status(400).json({
            error: "Request body is required"
        });
        return false;
    }
    return true;
};

export const validateJWT = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization'] as string
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