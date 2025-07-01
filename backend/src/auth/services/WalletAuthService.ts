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
        await this.prisma.$transaction(async (tx) => {
            // Delete the used auth nonce
            await tx.authNonces.delete({
                where: {
                    walletAddress: normalizedWalletAddress
                }
            });
            
            // Create or update user
            await tx.user.upsert({
                where: {
                    walletAddress: normalizedWalletAddress
                },
                update: {
                    // Update timestamp or any other fields you want to refresh on login
                    updatedAt: new Date()
                },
                create: {
                    walletAddress: normalizedWalletAddress,
                    // Add any other default fields you want for new users
                    isActive: true
                }
            });
        });
        const jwt = this.cryptoService.generateJWT({ walletAddress: normalizedWalletAddress}, '30d')
        return {
            jwt
        }
    }

    async createActionNonce({
        action,
        walletAddress,
        strategyType,
        asset,
        intervalAmount,
        intervalDays,
        acceptedSlippage,
        totalAmount,
        strategyId
    }: CreateActionNonceRequest): Promise<CreateActionNonceResponse> {
        const normalizedAddress = walletAddress.toLowerCase();
        const nonce = this.cryptoService.generateActionNonce();
        
        // Generate appropriate message based on action type
        let actionMessage: string;
        switch (action) {
            case 'CREATE_STRATEGY':
            case 'UPDATE_STRATEGY':
                actionMessage = this.cryptoService.createActionMessage(
                    nonce, action, strategyType!, asset!, 
                    intervalAmount!.toString(), parseInt(intervalDays!), 
                    parseInt(acceptedSlippage!), totalAmount!.toString()
                );
                break;
            case 'DELETE_STRATEGY':
                actionMessage = this.cryptoService.createDeleteActionMessage(
                    nonce, asset!, strategyType!
                );
                break;
            default:
                actionMessage = this.cryptoService.createActionMessage(
                    nonce, action, '', '', '', 0, 0, ''
                );
        }
    
        const existingUser = await this.prisma.user.findUnique({
            where: { walletAddress: walletAddress }
        });
    
        const allUsers = await this.prisma.user.findMany({
            where: {
                walletAddress: {
                    equals: normalizedAddress,
                    mode: 'insensitive'
                }
            }
        });
    
        // Create nonce with conditional data
        const nonceData: any = {
            walletAddress: normalizedAddress,
            action,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            nonce
        };
    
        // Add strategy-specific fields only when needed
        if (action === 'CREATE_STRATEGY' || action === 'UPDATE_STRATEGY') {
            nonceData.strategyType = strategyType;
            nonceData.asset = asset;
            nonceData.intervalDays = parseInt(intervalDays!);
            nonceData.intervalAmount = BigInt(intervalAmount!) * 1000000n;
            nonceData.acceptedSlippage = acceptedSlippage;
            nonceData.totalAmount = BigInt(totalAmount!) * 1000000n;
        } else if (action === 'DELETE_STRATEGY') {
            nonceData.strategyType = strategyType;
            nonceData.asset = asset;
            nonceData.strategyId = strategyId; // Reference to strategy being deleted
        }
    
        await this.prisma.actionNonce.create({
            data: nonceData
        });
    
        return {
            message: actionMessage
        };
    }

    async verifyActionNonce({
        message,
        signature,
        walletAddress
    }: VerifyActionRequest): Promise<VerifyActionResponse> {
        try {
            const normalizedAddress = walletAddress.toLowerCase();
            const parsedMessage = this.cryptoService.parseActionMessage(message);
            
            if (!parsedMessage) {
                throw new Error('Invalid message');
            }
    
            const { nonce, action, strategyType, asset, intervalAmount, intervalDays, acceptedSlippage, totalAmount } = parsedMessage;
    
            // Build the query conditions based on action type
            let whereConditions: any = {
                nonce: nonce,
                used: false,
                walletAddress: normalizedAddress,
                action,
                expiresAt: {
                    gt: new Date()
                }
            };
    
            // Add strategy-specific conditions
            if (action === 'CREATE_STRATEGY' || action === 'UPDATE_STRATEGY') {
                whereConditions = {
                    ...whereConditions,
                    strategyType,
                    asset,
                    intervalAmount: BigInt(intervalAmount!) * 1000000n,
                    intervalDays,
                    acceptedSlippage,
                    totalAmount: BigInt(totalAmount!) * 1000000n
                };
            } else if (action === 'DELETE_STRATEGY') {
                whereConditions = {
                    ...whereConditions,
                    strategyType,
                    asset
                };
            }
    
            const actionNonceData = await this.prisma.actionNonce.findFirst({
                where: whereConditions
            });
    
            if (!actionNonceData) {
                throw new Error('Invalid nonce or expired');
            }
    
            const unprefixedHex = getUnprefixedHex(signature);
            const recoverWalletAddress = await this.cryptoService.getWalletAddressFromSignature(
                message,
                `0x${unprefixedHex}`
            );
    
            if (recoverWalletAddress.toLowerCase().trim() !== actionNonceData.walletAddress.toLowerCase().trim()) {
                throw new Error("Signed using another wallet please check");
            }
    
            await this.prisma.actionNonce.update({
                where: {
                    id: actionNonceData.id
                },
                data: {
                    used: true
                }
            });
    
            // Return different responses based on action type
            if (action === 'DELETE_STRATEGY') {
                return {
                    txn: {
                        to: "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb", // USDT contract
                        data: this.createApproveTransaction(
                            "0", // Set allowance to 0 to revoke approval
                            strategyContractAddresses[asset!]
                        ),
                        value: "0x0",
                        gasLimit: "0x15F90", // 90,000 gas (typical for approve)
                        gasPrice: "0x77359400" // Or get from gas estimation API
                    },
                    actionId: actionNonceData.id,
                    message: 'Strategy deletion verified - approve transaction to revoke USDT allowance'
                };
            } else {
                // For CREATE/UPDATE - return transaction data
                return {
                    txn: {
                        to: "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb", // USDT contract
                        data: this.createApproveTransaction(
                            totalAmount!,
                            strategyContractAddresses[asset!]
                        ),
                        value: "0x0",
                        gasLimit: "0x15F90", // 90,000 gas (typical for approve)
                        gasPrice: "0x77359400" // Or get from gas estimation API
                    },
                    actionId: actionNonceData.id
                };
            }
        } catch (error) {
            console.log(error);
            throw new Error('Unable to verify action nonce');
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