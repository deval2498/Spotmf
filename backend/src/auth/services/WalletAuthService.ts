import { ethers } from "ethers";
import { PrismaClient } from "@prisma/client";
import { ChallengeRequest, ChallengeResponse, CreateActionNonceRequest, CreateActionNonceResponse, VerifyActionRequest, VerifyActionResponse, VerifySignatureRequest, VerifySignatureResponse  } from "../types/auth.types.ts";
import { CryptoService } from "../../shared/service/CryptoService.ts";
import { getUnprefixedHex } from "../../shared/utils/Validations.ts";
import { AuthException } from "../../shared/exceptions/Exceptions.ts";
const strategyContractAddresses:Record<string, string> = {
    'BTC': '0x10c5ef2415Da27917C7E1Ce02E0364c3dEf56A4A'
}
export class WalletAuthService {
    constructor(private prisma: PrismaClient, private cryptoService: CryptoService) {
    }
    async generateChallenge({walletAddress}: ChallengeRequest): Promise<ChallengeResponse> {
        const normalizedAddress = walletAddress.toLowerCase()
        const existingNonce = await this.prisma.authNonces.findUnique({
            where: {
                walletAddress: normalizedAddress,
                expiresAt: {gt: new Date()}
            }
        })
        if(existingNonce) {
            return {
                message: this.cryptoService.createAuthMessage(existingNonce.nonce)
            }
        }
        const nonce = this.cryptoService.generateAuthNonce()
        const message = this.cryptoService.createAuthMessage(nonce)
        await this.prisma.authNonces.upsert({
            where: { walletAddress: normalizedAddress },
            update: {
              nonce,
              expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 5 minutes from now
            },
            create: {
              walletAddress: normalizedAddress,
              nonce,
              expiresAt: new Date(Date.now() + 60 * 60 * 1000)
            }
          })
          return { message }
    }

    async verifyAndLogin({walletAddress, signature}: VerifySignatureRequest): Promise<VerifySignatureResponse> {
        const normalizedWalletAddress = walletAddress.toLowerCase()
        const nonceData = await this.prisma.authNonces.findUnique({
            where: {
                walletAddress: normalizedWalletAddress,
                expiresAt: { gt: new Date() }
            }
        })
        if(!nonceData) {
            throw new AuthException("No valid nonce found")
        }
        const message = this.cryptoService.createAuthMessage(nonceData.nonce)
        const unprefixedHex = getUnprefixedHex(signature)
        const recoverWalletAddress = await this.cryptoService.getWalletAddressFromSignature(message, `0x${unprefixedHex}`)
        if((await recoverWalletAddress).toLowerCase() != nonceData.walletAddress) {
            throw new AuthException('Invalid address, use the correct wallet to sign from')
        }
        const jwt = this.cryptoService.generateJWT({ walletAddress: normalizedWalletAddress}, '30d')
        await this.prisma.authNonces.delete({
            where: {
                walletAddress: normalizedWalletAddress
            }
        })
        return {
            jwt
        }
    }

    async createActionNonce({ action, strategyType, asset, intervalAmount, intervalDays, acceptedSlippage, totalAmount, walletAddress }: CreateActionNonceRequest): Promise<CreateActionNonceResponse> {
        const normalizedAddress = walletAddress.toLowerCase();
        const nonce = this.cryptoService.generateActionNonce();
        const actionMessage = this.cryptoService.createActionMessage(nonce, action, strategyType, asset, intervalAmount.toString(), intervalDays, acceptedSlippage, totalAmount.toString());
        await this.prisma.actionNonce.create({
            data: {
                walletAddress: normalizedAddress,
                action,
                strategyType,
                asset,
                intervalDays,
                intervalAmount: intervalAmount as bigint,
                acceptedSlippage,
                totalAmount: totalAmount as bigint,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000),
                nonce
            }
        })
        return {
            message: actionMessage
        }
    }

    async verifyActionNonce( {message, signature, walletAddress}: VerifyActionRequest ): Promise<VerifyActionResponse> {
        try {
            const normalizedAddress = walletAddress.toLowerCase();
        const parsedMessage = this.cryptoService.parseActionMessage(message);
        if(!parsedMessage) {
            throw new Error('Invalid message')
        }
        const {nonce, action, strategyType, asset, intervalAmount, intervalDays, acceptedSlippage, totalAmount} = parsedMessage
        const actionNonceData = await this.prisma.actionNonce.findUnique({
            where: {
                nonce: nonce,
                used: false,
                walletAddress: normalizedAddress,
                action,
                strategyType,
                asset,
                intervalAmount: BigInt(intervalAmount!),
                intervalDays,
                acceptedSlippage,
                totalAmount: BigInt(totalAmount!),
                expiresAt: {
                    gt: Date()
                }
            }
        })

        if(!actionNonceData) {
            throw new Error('Invalid nonce or expired')
        } 

        const unprefixedHex = getUnprefixedHex(signature)
        const recoverWalletAddress = await this.cryptoService.getWalletAddressFromSignature(message, `0x${unprefixedHex}`)
        if(recoverWalletAddress != actionNonceData.walletAddress) {
            throw new Error("Signed using another wallet please check")
        }

        await this.prisma.actionNonce.update({
            where: {
                id: actionNonceData.id
            },
            data: {
                used: true
            }
        })
        return {
            to: "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb", // USDT contract
            data: this.createApproveTransaction(
                totalAmount!,
                strategyContractAddresses[asset!]
            ),
            value: "0x0",
            gasLimit: "0x15F90", // 90,000 gas (typical for approve)
            gasPrice: "0x77359400" // Or get from gas estimation API
        };
        } catch (error) {
            throw new Error('Unable to verify action nonce')
        }
        
    }

    private createApproveTransaction(amount: string, spenderAddress: string): string {
        const iface = new ethers.Interface([
            "function approve(address spender, uint256 amount) external returns (bool)"
        ]);
        
        // Convert amount to Wei (assuming USDT has 6 decimals)
        const amountInWei = ethers.parseUnits(amount, 6);
        
        // Encode the function call
        const data = iface.encodeFunctionData("approve", [
            spenderAddress,
            amountInWei
        ]);
        
        return data;
    }
}