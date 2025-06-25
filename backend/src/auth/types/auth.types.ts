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
    actionData: string;
    walletAddress: string;
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
    to: string;
    data: string;
    value: string;
    gasLimit: string;
    gasPrice: string;
}