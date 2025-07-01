import { ASSET_TYPE, STRATEGY_TYPE } from "@prisma/client";

export interface ChallengeRequest {
    walletAddress: string;
}

export interface ChallengeResponse {
    message: string;
}

export interface VerifySignatureRequest {
    walletAddress: string;
    signature: string;
}

export interface VerifySignatureResponse {
    jwt: string;
}

export interface CreateActionNonceRequest {
    action: string;
    walletAddress: string;
    strategyType?: string;
    asset?: string;
    intervalAmount?: string;
    intervalDays?: string;
    acceptedSlippage?: string;
    totalAmount?: string;
    strategyId?: string; // For DELETE_STRATEGY
}

export interface CreateActionNonceResponse {
    message: string;
}

export interface VerifyActionRequest {
    message: string;
    walletAddress: string;
    signature: string;
}

export interface VerifyActionResponse {
    txn: {
    to: string;
    data: string;
    value: string;
    gasLimit: string;
    gasPrice: string;
    },
    actionId: string;
    message?: string
}