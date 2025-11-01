import { and, eq, gt } from 'drizzle-orm'
import { ethers, getAddress } from 'ethers'
import { SiweMessage } from 'siwe'

import { db } from '@/db/client.ts'
import { actionNonces, authNonces, users } from '@/db/schema.ts'
import { env } from '@/lib/env.ts'
import { AuthException } from '@/lib/errors.ts'
import {
  createActionMessage,
  createDeleteActionMessage,
  generateActionNonce,
  generateAuthNonce,
  generateJWT,
  getWalletAddressFromSignature,
  parseActionMessage,
  verifySiweSignature,
} from '@/services/crypto-service.ts'

const strategyContractAddresses: Record<string, string> = {
  BTC: '0x10c5ef2415Da27917C7E1Ce02E0364c3dEf56A4A',
}

function getUnprefixedHex(signature: string): string {
  return signature.startsWith('0x') ? signature.slice(2) : signature
}

export async function generateSiweNonce(walletAddress: string, chainId: number) {
  // Normalize to lowercase for DB storage, but use checksummed for SIWE
  const normalizedAddress = walletAddress.toLowerCase()
  const checksummedAddress = getAddress(walletAddress)

  const existingNonce = await db.query.authNonces.findFirst({
    where: and(
      eq(authNonces.walletAddress, normalizedAddress),
      gt(authNonces.expiresAt, new Date())
    ),
  })

  if (existingNonce) {
    const siweMessage = new SiweMessage({
      domain: env.APP_DOMAIN,
      address: checksummedAddress,
      uri: `${env.APP_URL}/login`,
      version: '1',
      chainId,
      nonce: existingNonce.nonce,
      issuedAt: new Date().toISOString(),
    })

    return {
      nonce: existingNonce.nonce,
      message: siweMessage.prepareMessage(),
    }
  }

  const nonce = generateAuthNonce()
  const siweMessage = new SiweMessage({
    domain: env.APP_DOMAIN,
    address: checksummedAddress,
    uri: `${env.APP_URL}/login`,
    version: '1',
    chainId,
    nonce,
    issuedAt: new Date().toISOString(),
  })

  const message = siweMessage.prepareMessage()

  await db
    .insert(authNonces)
    .values({
      walletAddress: normalizedAddress,
      nonce,
      chainId,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    })
    .onConflictDoUpdate({
      target: authNonces.walletAddress,
      set: {
        nonce,
        chainId,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    })

  return { nonce, message }
}

export async function verifySiweAndLogin(message: string, signature: string) {
  const verificationResult = await verifySiweSignature(message, signature)

  if (!verificationResult.success || !verificationResult.address) {
    throw new AuthException(verificationResult.error || 'Signature verification failed')
  }

  // Get checksummed address from verification, normalize for DB
  const checksummedAddress = getAddress(verificationResult.address)
  const normalizedAddress = verificationResult.address.toLowerCase()
  const nonce = verificationResult.nonce

  const nonceData = await db.query.authNonces.findFirst({
    where: and(
      eq(authNonces.walletAddress, normalizedAddress),
      eq(authNonces.nonce, nonce!),
      gt(authNonces.expiresAt, new Date())
    ),
  })

  if (!nonceData) {
    throw new AuthException('Nonce expired or not found')
  }

  if (nonceData.walletAddress.toLowerCase() !== normalizedAddress) {
    throw new AuthException('Address mismatch')
  }

  await db.transaction(async (tx) => {
    await tx.delete(authNonces).where(eq(authNonces.walletAddress, normalizedAddress))

    await tx
      .insert(users)
      .values({
        walletAddress: normalizedAddress,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: users.walletAddress,
        set: {
          updatedAt: new Date(),
        },
      })
  })

  const token = generateJWT({ walletAddress: normalizedAddress }, '30d')

  return {
    success: true,
    address: checksummedAddress,
    sessionToken: token,
  }
}

export async function createActionNonce(params: {
  action: string
  walletAddress: string
  strategyType?: string
  asset?: string
  intervalAmount?: string
  intervalDays?: string
  acceptedSlippage?: string
  totalAmount?: string
  strategyId?: string
}) {
  const {
    action,
    walletAddress,
    strategyType,
    asset,
    intervalAmount,
    intervalDays,
    acceptedSlippage,
    totalAmount,
    strategyId,
  } = params

  const normalizedAddress = walletAddress.toLowerCase()
  const nonce = generateActionNonce()

  let actionMessage: string
  switch (action) {
    case 'CREATE_STRATEGY':
    case 'UPDATE_STRATEGY':
      actionMessage = createActionMessage(
        nonce,
        action,
        strategyType!,
        asset!,
        intervalAmount!.toString(),
        parseInt(intervalDays!),
        parseInt(acceptedSlippage!),
        totalAmount!.toString()
      )
      break
    case 'DELETE_STRATEGY':
      actionMessage = createDeleteActionMessage(nonce, asset!, strategyType!)
      break
    default:
      actionMessage = createActionMessage(nonce, action, '', '', '', 0, 0, '')
  }

  const nonceData: Record<string, unknown> = {
    walletAddress: normalizedAddress,
    action,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    nonce,
  }

  if (action === 'CREATE_STRATEGY' || action === 'UPDATE_STRATEGY') {
    nonceData.strategyType = strategyType
    nonceData.asset = asset
    nonceData.intervalDays = parseInt(intervalDays!)
    nonceData.intervalAmount = BigInt(intervalAmount!) * 1000000n
    nonceData.acceptedSlippage = acceptedSlippage
    nonceData.totalAmount = BigInt(totalAmount!) * 1000000n
  } else if (action === 'DELETE_STRATEGY') {
    nonceData.strategyType = strategyType
    nonceData.asset = asset
    nonceData.strategyId = strategyId
  }

  await db.insert(actionNonces).values(nonceData as typeof actionNonces.$inferInsert)

  return {
    message: actionMessage,
  }
}

export async function verifyActionNonce(
  message: string,
  signature: string,
  walletAddress: string
) {
  try {
    const normalizedAddress = walletAddress.toLowerCase()
    const parsedMessage = parseActionMessage(message)

    if (!parsedMessage) {
      throw new Error('Invalid message')
    }

    const {
      nonce,
      action,
      strategyType,
      asset,
      intervalAmount,
      intervalDays,
      acceptedSlippage,
      totalAmount,
    } = parsedMessage

    const whereConditions: Record<string, unknown> = {
      nonce,
      used: false,
      walletAddress: normalizedAddress,
      action,
    }

    if (action === 'CREATE_STRATEGY' || action === 'UPDATE_STRATEGY') {
      Object.assign(whereConditions, {
        strategyType,
        asset,
        intervalAmount: BigInt(intervalAmount!) * 1000000n,
        intervalDays,
        acceptedSlippage,
        totalAmount: BigInt(totalAmount!) * 1000000n,
      })
    } else if (action === 'DELETE_STRATEGY') {
      Object.assign(whereConditions, {
        strategyType,
        asset,
      })
    }

    const actionNonceData = await db.query.actionNonces.findFirst({
      where: and(
        eq(actionNonces.nonce, nonce),
        eq(actionNonces.used, false),
        eq(actionNonces.walletAddress, normalizedAddress),
        eq(actionNonces.action, action),
        gt(actionNonces.expiresAt, new Date())
      ),
    })

    if (!actionNonceData) {
      throw new Error('Invalid nonce or expired')
    }

    const unprefixedHex = getUnprefixedHex(signature)
    const recoverWalletAddress = await getWalletAddressFromSignature(
      message,
      `0x${unprefixedHex}`
    )

    if (
      recoverWalletAddress.toLowerCase().trim() !==
      actionNonceData.walletAddress.toLowerCase().trim()
    ) {
      throw new Error('Signed using another wallet please check')
    }

    await db
      .update(actionNonces)
      .set({ used: true })
      .where(eq(actionNonces.id, actionNonceData.id))

    if (action === 'DELETE_STRATEGY') {
      return {
        txn: {
          to: '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb',
          data: createApproveTransaction('0', strategyContractAddresses[asset!]),
          value: '0x0',
          gasLimit: '0x15F90',
          gasPrice: '0x77359400',
        },
        actionId: actionNonceData.id,
        message:
          'Strategy deletion verified - approve transaction to revoke USDT allowance',
      }
    }

    return {
      txn: {
        to: '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb',
        data: createApproveTransaction(totalAmount!, strategyContractAddresses[asset!]),
        value: '0x0',
        gasLimit: '0x15F90',
        gasPrice: '0x77359400',
      },
      actionId: actionNonceData.id,
    }
  } catch {
    throw new Error('Unable to verify action nonce')
  }
}

function createApproveTransaction(amount: string, spenderAddress: string): string {
  const iface = new ethers.Interface([
    'function approve(address spender, uint256 amount) external returns (bool)',
  ])

  const amountInWei = ethers.parseUnits(amount, 6)

  const data = iface.encodeFunctionData('approve', [spenderAddress, amountInWei])

  return data
}
