export function ethereumWalletValidation(walletAddress: string): boolean {
    const regex = /^0x[0-9a-fA-F]{40}$/
    return regex.test(walletAddress)
}

export function ethereumSignatureValidation(signature: string): boolean {
    const regex = /^0x[0-9a-fA-F]{130}$/
    return regex.test(signature)
}
