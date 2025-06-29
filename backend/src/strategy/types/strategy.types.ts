import { PrismaClient,Prisma, STRATEGY_TYPE } from "@prisma/client";

export interface GetAllUserStrategyRequest {
    walletAddress: string;
}

export interface GetUserStrategyRequest {
    userStrategyId: string;
}

export interface CreateUserStrategyRequest {
    signature: string;
    actionId: string;
    walletAddress: string;
}

export interface DeleteUserStrategyRequest {
    userStrategyId: string;
    walletAddress: string;
}

export interface UpdateUserStrategyRequest {
    walletAddress: string;
    userStrategyId: string;      // Required - which strategy to update
    txReceipt?: string;          // Optional - only if blockchain action needed
    contractAddress?: string;    // Optional
    amount?: string;             // Optional - user can update just this
    asset?: string;              // Optional - user can change asset
    intervalDays?: string;       // Optional - user can change interval
}