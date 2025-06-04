import { PrismaClient, Prisma } from "@prisma/client";
import { ChallengeRequest, ChallengeResponse, VerifySignatureRequest, VerifySignatureResponse  } from "../types/auth.types";
import { CryptoService } from "@/shared/service/CryptoService";
import { getUnprefixedHex } from "@/shared/utils/Validations";
import { AuthException } from "@/shared/exceptions/Exceptions";
export class WalletAuthService {
    constructor(private prisma: PrismaClient, private cyrptoService: CryptoService) {
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
                message: this.cyrptoService.createAuthMessage(existingNonce.nonce)
            }
        }
        const nonce = this.cyrptoService.generateAuthNonce()
        const message = this.cyrptoService.createAuthMessage(nonce)
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
        const message = this.cyrptoService.createAuthMessage(nonceData.nonce)
        const unprefixedHex = getUnprefixedHex(signature)
        const recoverWalletAddress = this.cyrptoService.getWalletAddressFromSignature(message, `0x${unprefixedHex}`)
        if((await recoverWalletAddress).toLowerCase() != nonceData.walletAddress) {
            throw new AuthException('Invalid address, use the correct wallet to sign from')
        }
        await this.prisma.authNonces.delete({
            where: {
                walletAddress: normalizedWalletAddress
            }
        })
        const jwt = this.cyrptoService.generateJWT({ walletAddress: normalizedWalletAddress}, '30d')
        return {
            jwt
        }
    }

}