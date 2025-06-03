export function ethereumWalletValidation(walletAddress: string): boolean {
    const regex = /^0x[0-9a-fA-F]{40}$/
    return regex.test(walletAddress)
}

export function ethereumSignatureValidation(signature: string): boolean {
    const regex = /^0x[0-9a-fA-F]{130}$/
    return regex.test(signature)
}

export function getUnprefixedHex(prefixedHex: string): string {
    return prefixedHex.slice(2)
}

export function isValidNonce(nonce: string) : boolean {
    return /^0x[0-9a-fA-F]{64}$/.test(nonce)
}