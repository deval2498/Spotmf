import * as crypto from "crypto"
import { recoverMessageAddress, Signature } from "viem"
import jwt from "jsonwebtoken";
import { SignOptions } from "jsonwebtoken"
export class CryptoService {
    generateAuthNonce(): string {
        return crypto.randomBytes(32).toString('hex')
    }

    generateActionNonce(): string {
        return crypto.randomBytes(32).toString('hex')
    }

    createAuthMessage(nonce: string): string {
        return `Sign this message to authenticate ${nonce}`
    }

    createActionMessage(nonce: string, action: string, actionData: string) {
        return `Sign this message to authenticate action ${this.formatActionData(action, actionData)} with nonce: ${nonce}`
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

    private formatActionData(action: string, actionData: any): string {
        switch (action) {
            case 'CREATE_STRATEGY':
                return `Strategy Details:
    - Asset: ${actionData.asset}
    - Interval Amount: ${actionData.intervalAmount}
    - Interval Days: ${actionData.intervalDays}
    - Slippage: ${actionData.acceptedSlippage || '1.0'}%
    - Total Amount: ${actionData.totalAmount}
    `;
    
            case 'UPDATE_PROFILE':
                return `Profile Updates:
    - Name: ${actionData.name || 'No change'}
    - Email: ${actionData.email || 'No change'}`;
    
            default:
                return `Action Data:
    ${JSON.stringify(actionData, null, 2)}`;
        }
    }

    parseActionMessage(message: string): { action: string; actionData: any; nonce: string } | null {
        try {
            // Extract nonce using regex
            const nonceMatch = message.match(/with nonce: (.+)$/);
            if (!nonceMatch) return null;
            const nonce = nonceMatch[1];
    
            // Extract action - it's between "authenticate action " and the first newline or "with nonce"
            const actionMatch = message.match(/authenticate action (.+?) with nonce:/s);
            if (!actionMatch) return null;
            const actionSection = actionMatch[1].trim();
    
            // Determine action type based on content
            let action: string = "UNKNOWN"; // default value
            let actionData: any = {};
    
            if (actionSection.includes('Strategy Details:')) {
                action = 'CREATE_STRATEGY';
                actionData = this.parseStrategyData(actionSection);
            } else if (actionSection.includes('Profile Updates:')) {
                action = 'UPDATE_PROFILE';
                actionData = this.parseProfileData(actionSection);
            } else if (actionSection.includes('Action Data:')) {
                // Try to parse JSON for default case
                const jsonMatch = actionSection.match(/Action Data:\s*(.+)/s);
                if (jsonMatch) {
                    try {
                        actionData = JSON.parse(jsonMatch[1].trim());
                        action = 'UNKNOWN'; // You might want to handle this differently
                    } catch {
                        return null;
                    }
                }
            } else {
                return null; // Explicitly return if no action matched
            }
    
            return { action, actionData, nonce };
        } catch (error) {
            return null;
        }
    }
    
    private parseStrategyData(actionSection: string): any {
        const data: any = {};
        
        const assetMatch = actionSection.match(/- Asset: (.+)/);
        if (assetMatch) data.asset = assetMatch[1].trim();
        
        const intervalAmountMatch = actionSection.match(/- Interval Amount: (.+)/);
        if (intervalAmountMatch) data.intervalAmount = intervalAmountMatch[1].trim();
        
        const intervalDaysMatch = actionSection.match(/- Interval Days: (.+)/);
        if (intervalDaysMatch) data.intervalDays = parseFloat(intervalDaysMatch[1].trim());
        
        const slippageMatch = actionSection.match(/- Slippage: (.+)%/);
        if (slippageMatch) data.acceptedSlippage = parseFloat(slippageMatch[1].trim());
        
        const totalAmountMatch = actionSection.match(/- Total Amount: (.+)/);
        if (totalAmountMatch) data.totalAmount = totalAmountMatch[1].trim();
        
        return data;
    }

    private parseProfileData(actionSection: string): any {
        const data: any = {};
        
        const nameMatch = actionSection.match(/- Name: (.+)/);
        if (nameMatch) {
            const name = nameMatch[1].trim();
            if (name !== 'No change') data.name = name;
        }
        
        const emailMatch = actionSection.match(/- Email: (.+)/);
        if (emailMatch) {
            const email = emailMatch[1].trim();
            if (email !== 'No change') data.email = email;
        }
        
        return data;
    }
    
}