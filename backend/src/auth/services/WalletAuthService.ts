import { ChallengeRequest, ChallengeResponse, VerifySignatureRequest, VerifySignatureResponse  } from "../types/auth.types.js";

class WalletAuthService {
    async generateChallenge({walletAddress}: ChallengeRequest): Promise<ChallengeResponse> {

    }
    async verifyAndLogin({walletAddress, signature}: VerifySignatureRequest): Promise<VerifySignatureResponse> {
        
    }
}