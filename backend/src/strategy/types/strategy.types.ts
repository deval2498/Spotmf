interface GetAllUserStrategyRequest {
    walletAddress: string;
}

interface CreateUserStrategyRequest {
    txReceipt: string;
    contractAddress: string;
    amount: string;
    strategyId: string;
    asset: string;
    intervalDays: string;
}

interface DeleteUserStrategyRequest {
    userStrategyId: string;
}

interface UpdateUserStrategyRequest {
    userStrategyId: string;      // Required - which strategy to update
    txReceipt?: string;          // Optional - only if blockchain action needed
    contractAddress?: string;    // Optional
    amount?: string;             // Optional - user can update just this
    asset?: string;              // Optional - user can change asset
    intervalDays?: string;       // Optional - user can change interval
}