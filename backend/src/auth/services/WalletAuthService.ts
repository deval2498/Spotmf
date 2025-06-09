import { PrismaClient } from "@prisma/client";
import { ChallengeRequest, ChallengeResponse, VerifySignatureRequest, VerifySignatureResponse  } from "../types/auth.types.ts";
import { CryptoService } from "../../shared/service/CryptoService.ts";
import { getUnprefixedHex } from "../../shared/utils/Validations.ts";
import { AuthException } from "../../shared/exceptions/Exceptions.ts";
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
              expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
            },
            create: {
              walletAddress: normalizedAddress,
              nonce,
              expiresAt: new Date(Date.now() + 5 * 60 * 1000)
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
        const recoverWalletAddress = this.cryptoService.getWalletAddressFromSignature(message, `0x${unprefixedHex}`)
        if((await recoverWalletAddress).toLowerCase() != nonceData.walletAddress) {
            throw new AuthException('Invalid address, use the correct wallet to sign from')
        }
        await this.prisma.authNonces.delete({
            where: {
                walletAddress: normalizedWalletAddress
            }
        })
        const jwt = this.cryptoService.generateJWT({ walletAddress: normalizedWalletAddress}, '30d')
        return {
            jwt
        }
    }

}