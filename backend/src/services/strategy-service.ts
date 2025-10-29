import { desc, eq } from 'drizzle-orm'

import { db } from '@/db/client.ts'
import { actionNonces, userStrategies } from '@/db/schema.ts'
import { NotFoundError } from '@/lib/errors.ts'

export async function getUserStrategy(userStrategyId: string) {
  const strategy = await db.query.userStrategies.findFirst({
    where: eq(userStrategies.id, userStrategyId),
    with: {
      actionNonce: true,
    },
  })

  return strategy || null
}

export async function getUserStrategies(params: {
  walletAddress: string
  cursor?: string
  limit?: number
}) {
  const { walletAddress, cursor, limit = 10 } = params
  const take = limit + 1

  const strategies = await db.query.userStrategies.findMany({
    where: eq(userStrategies.walletAddress, walletAddress),
    with: {
      actionNonce: true,
    },
    orderBy: desc(userStrategies.createdAt),
    limit: take,
    ...(cursor && {
      offset: 1,
    }),
  })

  const hasMore = strategies.length > limit
  const data = hasMore ? strategies.slice(0, -1) : strategies
  const nextCursor = hasMore ? data[data.length - 1].id : null

  return {
    data,
    nextCursor,
    hasMore,
  }
}

export async function storeSignedStrategyTxn(params: {
  txHash: string
  actionId: string
  walletAddress: string
}) {
  const { txHash, actionId, walletAddress } = params

  const actionData = await db.query.actionNonces.findFirst({
    where: eq(actionNonces.id, actionId),
  })

  if (!actionData) {
    throw new NotFoundError('Invalid action id')
  }

  if (actionData.walletAddress !== walletAddress) {
    throw new Error('Action data wallet address mismatch, transaction not saved!')
  }

  await db.insert(userStrategies).values({
    walletAddress: actionData.walletAddress,
    actionNonceId: actionData.id,
    txHash,
  })

  return {
    message: 'Transaction stored',
  }
}
