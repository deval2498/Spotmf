import crypto from 'crypto'
import type { SignOptions } from 'jsonwebtoken'
import jwt from 'jsonwebtoken'
import { recoverMessageAddress } from 'viem'

import { env } from '@/lib/env.ts'

const VALID_STRATEGY_TYPES = ['DCA', 'DCA_WITH_DMA'] as const
const VALID_ASSET_TYPES = ['BTC', 'ETH', 'HYPE'] as const

type StrategyType = (typeof VALID_STRATEGY_TYPES)[number]
type AssetType = (typeof VALID_ASSET_TYPES)[number]

export function generateAuthNonce(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function generateActionNonce(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function createAuthMessage(nonce: string): string {
  return `Sign this message to authenticate ${nonce}`
}

export function getWalletAddressFromSignature(
  message: string,
  signature: `0x${string}`
): Promise<string> {
  return recoverMessageAddress({ message, signature })
}

export function generateJWT(
  payload: object,
  expiresIn: SignOptions['expiresIn'] = '30d'
): string {
  const options: SignOptions = { expiresIn }
  return jwt.sign(payload, env.JWT_SECRET, options)
}

export function verifyJWT(
  token: string
): { walletAddress?: string; [key: string]: unknown } | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      walletAddress: string
      [key: string]: unknown
    }
    return decoded
  } catch {
    return null
  }
}

export function createActionMessage(
  nonce: string,
  action: string,
  strategyType: string,
  asset: string,
  intervalAmount: string,
  intervalDays: number,
  acceptedSlippage: number,
  totalAmount: string
): string {
  switch (action) {
    case 'CREATE_STRATEGY':
      return `Sign this message to authenticate action CREATE_STRATEGY with details:
Asset: ${asset}
Strategy Type: ${strategyType}
Interval Amount: ${intervalAmount}
Interval Days: ${intervalDays}
Accepted Slippage: ${acceptedSlippage}%
Total Amount: ${totalAmount}
Nonce: ${nonce}`

    case 'UPDATE_STRATEGY':
      return `Sign this message to authenticate action UPDATE_STRATEGY with details:
Asset: ${asset}
Strategy Type: ${strategyType}
Interval Amount: ${intervalAmount}
Interval Days: ${intervalDays}
Accepted Slippage: ${acceptedSlippage}%
Total Amount: ${totalAmount}
Nonce: ${nonce}`

    case 'UPDATE_PROFILE':
      return `Sign this message to authenticate action UPDATE_PROFILE with nonce: ${nonce}`

    default:
      return `Sign this message to authenticate action ${action} with nonce: ${nonce}`
  }
}

export function createDeleteActionMessage(
  nonce: string,
  asset: string,
  strategyType: string
): string {
  return `Sign this message to authenticate action DELETE_STRATEGY with details:
    Asset: ${asset}
    Strategy Type: ${strategyType}
    Nonce: ${nonce}`
}

export function parseActionMessage(message: string): {
  nonce: string
  action: string
  asset?: AssetType
  strategyType?: StrategyType
  intervalAmount?: string
  intervalDays?: number
  acceptedSlippage?: string
  totalAmount?: string
} {
  const lines = message.split('\n')

  const nonceLine = lines.find((line) => line.startsWith('Nonce:'))
  const nonce = nonceLine ? nonceLine.replace('Nonce:', '').trim() : ''

  const actionMatch = message.match(/authenticate action (\w+)/)
  const action = actionMatch ? actionMatch[1] : ''

  if (action === 'CREATE_STRATEGY' || action === 'UPDATE_STRATEGY') {
    const assetLine = lines.find((line) => line.startsWith('Asset:'))
    const strategyTypeLine = lines.find((line) => line.startsWith('Strategy Type:'))
    const intervalAmountLine = lines.find((line) => line.startsWith('Interval Amount:'))
    const intervalDaysLine = lines.find((line) => line.startsWith('Interval Days:'))
    const slippageLine = lines.find((line) => line.startsWith('Accepted Slippage:'))
    const totalAmountLine = lines.find((line) => line.startsWith('Total Amount:'))

    const asset = assetLine?.replace('Asset:', '').trim()
    const strategyType = strategyTypeLine?.replace('Strategy Type:', '').trim()
    const intervalAmount = intervalAmountLine?.replace('Interval Amount:', '').trim()
    const intervalDaysStr = intervalDaysLine?.replace('Interval Days:', '').trim()
    const acceptedSlippage = slippageLine
      ?.replace('Accepted Slippage:', '')
      .replace('%', '')
      .trim()
    const totalAmount = totalAmountLine?.replace('Total Amount:', '').trim()

    if (!asset || !isValidAssetType(asset)) {
      throw new Error(`Invalid asset type: ${asset}`)
    }

    if (!strategyType || !isValidStrategyType(strategyType)) {
      throw new Error(`Invalid strategy type: ${strategyType}`)
    }

    return {
      nonce,
      action,
      asset: asset as AssetType,
      strategyType: strategyType as StrategyType,
      intervalAmount,
      intervalDays: Number(intervalDaysStr),
      acceptedSlippage,
      totalAmount,
    }
  }

  if (action === 'DELETE_STRATEGY') {
    const assetLine = lines.find((line) => line.startsWith('Asset:'))
    const strategyTypeLine = lines.find((line) => line.startsWith('Strategy Type:'))

    const asset = assetLine?.replace('Asset:', '').trim()
    const strategyType = strategyTypeLine?.replace('Strategy Type:', '').trim()

    if (!asset || !isValidAssetType(asset)) {
      throw new Error(`Invalid asset type: ${asset}`)
    }

    if (!strategyType || !isValidStrategyType(strategyType)) {
      throw new Error(`Invalid strategy type: ${strategyType}`)
    }

    return {
      nonce,
      action,
      asset: asset as AssetType,
      strategyType: strategyType as StrategyType,
    }
  }

  return {
    nonce,
    action,
  }
}

function isValidStrategyType(value: string): value is StrategyType {
  return VALID_STRATEGY_TYPES.includes(value as StrategyType)
}

function isValidAssetType(value: string): value is AssetType {
  return VALID_ASSET_TYPES.includes(value as AssetType)
}
