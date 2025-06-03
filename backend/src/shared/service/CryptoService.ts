import crypto from "crypto"
import { recoverMessageAddress, Signature } from "viem"
import jwt, { SignOptions } from "jsonwebtoken"
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

    isValidNonce(nonce: string) : boolean {
        return /^0x[0-9a-fA-F]{64}$/.test(nonce)
    }

    getWalletAddressFromSignature(message: string, signature: `0x${string}`): Promise<string> {
        return recoverMessageAddress({message, signature})
    }

    getUnprefixedHex(prefixedHex: string): string {
        return prefixedHex.slice(2)
    }

    generateJWT(payload: object, expiresIn: SignOptions['expiresIn'] = '30d'): string {
        const options: SignOptions = { expiresIn }
        return jwt.sign(
            payload,
            process.env.JWT_SECRET as string,
            options
        )
    }
}