import { Prisma, PrismaClient, ASSET_TYPE, STRATEGY_TYPE, UserStrategy } from "@prisma/client";
import type { GetAllUserStrategyRequest, GetUserStrategyRequest, CreateUserStrategyRequest, PaginatedUserStrategies, GetUserStrategiesRequest } from "../types/strategy.types.ts";

export class UserStrategyService {
    constructor(private prisma: PrismaClient){}
    async getUserStrategy({userStrategyId}: GetUserStrategyRequest): Promise<UserStrategy | null> {
        return await this.prisma.userStrategy.findUnique({
            where: {
                id: userStrategyId
            },
            include: {
                actionNonce: true
            }
        });
    }

    async getUserStrategies({
        cursor,
        limit = 10,
        walletAddress
    }: GetUserStrategiesRequest): Promise<PaginatedUserStrategies> {
        const take = limit + 1; // Fetch one extra to check if there's more
        
        const userStrategies = await this.prisma.userStrategy.findMany({
            where: {
                walletAddress: walletAddress
            },
            include: {
                actionNonce: true
            },
            orderBy: {
                createdAt: 'desc' // Consistent ordering is crucial
            },
            take,
            ...(cursor && {
                cursor: { id: cursor },
                skip: 1 // Skip the cursor item itself
            })
        });
    
        const hasMore = userStrategies.length > limit;
        const data = hasMore ? userStrategies.slice(0, -1) : userStrategies;
        const nextCursor = hasMore ? data[data.length - 1].id : null;
    
        return {
            data,
            nextCursor,
            hasMore
        };
    }

    // async createUserStrategy(createUserStrategyObject: CreateUserStrategyRequest): Promise<User_Strategy | null> {
    //     const strategyData = await this.prisma.strategy.findUnique({
    //         where: {
    //             type: createUserStrategyObject.strategyType
    //         }
    //     })
    //     if(!strategyData) {
    //         throw new Error("Invalid strategy type")
    //     }
    //     return await this.prisma.$transaction(async(tx) => {
    //         await tx.funds.create({
    //             data: {
    //                 walletAddress: createUserStrategyObject.walletAddress,
    //                 contractAddress: createUserStrategyObject.contractAddress,
    //                 txReceipt: createUserStrategyObject.txReceipt,
    //                 amount: BigInt(createUserStrategyObject.approvedAmount.toString()),
    //             }
    //         })
    
    //         return await tx.user_Strategy.create({
    //             data: {
    //                 strategyId: strategyData.id,
    //                 walletAddress: createUserStrategyObject.walletAddress,
    //                 asset: createUserStrategyObject.asset as ASSET_TYPE,
    //                 intervalAmount: BigInt(createUserStrategyObject.amount),
    //                 intervalDays: parseFloat(createUserStrategyObject.intervalDays),
    //                 acceptedSlippage: parseFloat(createUserStrategyObject.acceptedSlippage)
    //             }
    //         })
    //     })
        
    // }

    async storeSignedStrategyTxn({ txHash, actionId, walletAddress }: CreateUserStrategyRequest): Promise<{message: string}> {
        const actionData = await this.prisma.actionNonce.findUnique({
            where: {
                id: actionId
            }
        })
        
        if(!actionData) {
            throw new Error('Invalid action id')
        }
        
        if(actionData.walletAddress != walletAddress) {
            throw new Error('Action data wallet address mismatch, transaction not saved!')
        }
        
        
        // Create UserStrategy with required fields
        await this.prisma.userStrategy.create({
            data: {
                walletAddress: actionData.walletAddress,
                actionNonceId: actionData.id,
                txHash: txHash,
            }
        })
        return {
            message: "Transaction stored"
        }
    }
}