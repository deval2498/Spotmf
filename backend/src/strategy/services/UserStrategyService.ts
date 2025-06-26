import { Prisma, PrismaClient, User_Strategy, ASSET_TYPE } from "@prisma/client";
import type { GetAllUserStrategyRequest, GetUserStrategyRequest, CreateUserStrategyRequest } from "../types/strategy.types.ts";

export class UserStrategyService {
    constructor(private prisma: PrismaClient){}
    async getAllUserStrategy({walletAddress}: GetAllUserStrategyRequest): Promise<User_Strategy[]> {
        return await this.prisma.user_Strategy.findMany({
            where: {
                walletAddress
            }
        })
    }

    async getUserStrategy({userStrategyId}: GetUserStrategyRequest): Promise<User_Strategy | null> {
        return await this.prisma.user_Strategy.findUnique({
            where: {
                id: userStrategyId
            }
        })
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

    async storeSignedStrategyTxn({ signature, actionId, walletAddress }: CreateUserStrategyRequest): Promise<void> {
        const actionData = await this.prisma.actionNonce.findUnique({
            where : {
                id: actionId
            }
        })
        if(!actionData) {
            throw new Error('Invalid action id')
        }
        if(actionData.walletAddress != walletAddress) {
            throw new Error('Action data wallet address mismatch, transaction not saved!')
        }
    }
}