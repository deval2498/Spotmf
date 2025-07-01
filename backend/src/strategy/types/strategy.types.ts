import { PrismaClient,Prisma, STRATEGY_TYPE, UserStrategy } from "@prisma/client";

export interface GetAllUserStrategyRequest {
    walletAddress: string;
}

export interface GetUserStrategyRequest {
    userStrategyId: string;
}

export interface CreateUserStrategyRequest {
    txHash: string;
    actionId: string;
    walletAddress: string;
}

export interface GetUserStrategiesRequest {
    cursor?: string;  // ID of last item from previous page
    limit?: number;   // Number of items per page (default: 10)
    walletAddress?: string;  // Filter by user
}

export interface PaginatedUserStrategies {
    data: UserStrategy[];
    nextCursor: string | null;
    hasMore: boolean;
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