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