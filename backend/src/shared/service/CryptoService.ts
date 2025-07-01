import * as crypto from "crypto"
import { recoverMessageAddress, Signature } from "viem"
import jwt from "jsonwebtoken";
import { SignOptions } from "jsonwebtoken"
import { ASSET_TYPE, STRATEGY_TYPE } from "@prisma/client";
export class CryptoService {


    private readonly VALID_STRATEGY_TYPES: string[] = ['DCA', 'DCA_WITH_DMA'];
    private readonly VALID_ASSET_TYPES: string[] = ['BTC', 'ETH', 'HYPE'];
    
    generateAuthNonce(): string {
        return crypto.randomBytes(32).toString('hex')
    }

    generateActionNonce(): string {
        return crypto.randomBytes(32).toString('hex')
    }

    createAuthMessage(nonce: string): string {
        return `Sign this message to authenticate ${nonce}`
    }

    getWalletAddressFromSignature(message: string, signature: `0x${string}`): Promise<string> {
        return recoverMessageAddress({message, signature})
    }

    generateJWT(payload: object, expiresIn: SignOptions['expiresIn'] = '30d'): string {
        const options: SignOptions = { expiresIn }
        return jwt.sign(
            payload,
            process.env.JWT_SECRET as string,
            options
        )
    }

    verifyJWT(token: string): { walletAddress?: string; [key: string]: any } | null {
        try {
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET as string
            ) as { walletAddress: string; [key: string]: any };
            
            return decoded;
        } catch (error) {
            return null;
        }
    }
    createActionMessage(
        nonce: string, 
        action: string, 
        strategyType: string,
        asset: string,
        intervalAmount: string,
        intervalDays: number,
        acceptedSlippage: number,
        totalAmount: string
    ): string {
        switch (action) {
            case 'CREATE_STRATEGY':
                return `Sign this message to authenticate action CREATE_STRATEGY with details:
Asset: ${asset}
Strategy Type: ${strategyType}
Interval Amount: ${intervalAmount}
Interval Days: ${intervalDays}
Accepted Slippage: ${acceptedSlippage}%
Total Amount: ${totalAmount}
Nonce: ${nonce}`;

            case 'UPDATE_STRATEGY':
                return `Sign this message to authenticate action UPDATE_STRATEGY with details:
Asset: ${asset}
Strategy Type: ${strategyType}
Interval Amount: ${intervalAmount}
Interval Days: ${intervalDays}
Accepted Slippage: ${acceptedSlippage}%
Total Amount: ${totalAmount}
Nonce: ${nonce}`;

            case 'UPDATE_PROFILE':
                return `Sign this message to authenticate action UPDATE_PROFILE with nonce: ${nonce}`;

            default:
                return `Sign this message to authenticate action ${action} with nonce: ${nonce}`;
        }
    }

    createDeleteActionMessage(
        nonce: string,
        asset: string,
        strategyType: string
    ): string {
        return `Sign this message to authenticate action DELETE_STRATEGY with details:
    Asset: ${asset}
    Strategy Type: ${strategyType}
    Nonce: ${nonce}`;
    }

    // Parse message string back to data
    parseActionMessage(message: string): {
        nonce: string;
        action: string;
        asset?: ASSET_TYPE;
        strategyType?: STRATEGY_TYPE;
        intervalAmount?: string;
        intervalDays?: number;
        acceptedSlippage?: string;
        totalAmount?: string;
    } {
        const lines = message.split('\n');
        
        // Extract nonce (always present)
        const nonceLine = lines.find(line => line.startsWith('Nonce:'));
        const nonce = nonceLine ? nonceLine.replace('Nonce:', '').trim() : '';
        
        // Extract action
        const actionMatch = message.match(/authenticate action (\w+)/);
        const action = actionMatch ? actionMatch[1] : '';
        
        // For strategy actions with full details
        if (action === 'CREATE_STRATEGY' || action === 'UPDATE_STRATEGY') {
            const assetLine = lines.find(line => line.startsWith('Asset:'));
            const strategyTypeLine = lines.find(line => line.startsWith('Strategy Type:'));
            const intervalAmountLine = lines.find(line => line.startsWith('Interval Amount:'));
            const intervalDaysLine = lines.find(line => line.startsWith('Interval Days:'));
            const slippageLine = lines.find(line => line.startsWith('Accepted Slippage:'));
            const totalAmountLine = lines.find(line => line.startsWith('Total Amount:'));
    
            const asset = assetLine?.replace('Asset:', '').trim();
            const strategyType = strategyTypeLine?.replace('Strategy Type:', '').trim();
            const intervalAmount = intervalAmountLine?.replace('Interval Amount:', '').trim();
            const intervalDaysStr = intervalDaysLine?.replace('Interval Days:', '').trim();
            const acceptedSlippage = slippageLine?.replace('Accepted Slippage:', '').replace('%', '').trim();
            const totalAmount = totalAmountLine?.replace('Total Amount:', '').trim();
    
            if (!asset || !this.isValidAssetType(asset)) {
                throw new Error(`Invalid asset type: ${asset}`);
            }
            
            if (!strategyType || !this.isValidStrategyType(strategyType)) {
                throw new Error(`Invalid strategy type: ${strategyType}`);
            }
    
            return {
                nonce,
                action,
                asset: asset as ASSET_TYPE,
                strategyType: strategyType as STRATEGY_TYPE,
                intervalAmount,
                intervalDays: Number(intervalDaysStr),
                acceptedSlippage,
                totalAmount
            };
        }
        
        // For DELETE_STRATEGY - only needs asset and strategyType
        if (action === 'DELETE_STRATEGY') {
            const assetLine = lines.find(line => line.startsWith('Asset:'));
            const strategyTypeLine = lines.find(line => line.startsWith('Strategy Type:'));
    
            const asset = assetLine?.replace('Asset:', '').trim();
            const strategyType = strategyTypeLine?.replace('Strategy Type:', '').trim();
    
            if (!asset || !this.isValidAssetType(asset)) {
                throw new Error(`Invalid asset type: ${asset}`);
            }
            
            if (!strategyType || !this.isValidStrategyType(strategyType)) {
                throw new Error(`Invalid strategy type: ${strategyType}`);
            }
    
            return {
                nonce,
                action,
                asset: asset as ASSET_TYPE,
                strategyType: strategyType as STRATEGY_TYPE
            };
        }
        
        // For other actions, return basic info
        return {
            nonce,
            action
        };
    }

    private isValidStrategyType(value: string): value is STRATEGY_TYPE {
        return this.VALID_STRATEGY_TYPES.includes(value);
    }

    private isValidAssetType(value: string): value is ASSET_TYPE {
        return this.VALID_ASSET_TYPES.includes(value);
    }
    
}