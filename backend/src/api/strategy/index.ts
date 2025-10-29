import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'

import { failure, success } from '@/lib/response.ts'
import { type AuthContext, authMiddleware } from '@/middleware/auth.ts'
import * as strategyService from '@/services/strategy-service.ts'

import {
  getStrategiesQuerySchema,
  storeStrategySchema,
  strategyIdSchema,
} from './validators.ts'

export const strategyRoutes = new Hono<AuthContext>()

strategyRoutes.post(
  '/storeSignedStrategyTxn',
  authMiddleware,
  zValidator('json', storeStrategySchema),
  async (c) => {
    const walletAddress = c.get('walletAddress')
    const { txHash, actionId } = c.req.valid('json')

    const result = await strategyService.storeSignedStrategyTxn({
      txHash,
      actionId,
      walletAddress,
    })

    return success(c, result)
  }
)

strategyRoutes.get(
  '/',
  authMiddleware,
  zValidator('query', getStrategiesQuerySchema),
  async (c) => {
    const walletAddress = c.get('walletAddress')
    const { cursor, limit } = c.req.valid('query')

    const result = await strategyService.getUserStrategies({
      walletAddress,
      cursor,
      limit,
    })

    const transformedResult = {
      ...result,
      data: result.data.map((item) =>
        JSON.parse(
          JSON.stringify(item, (_key, value) =>
            typeof value === 'bigint' ? value.toString() : value
          )
        )
      ),
    }

    return success(c, transformedResult)
  }
)

strategyRoutes.get(
  '/:userStrategyId',
  authMiddleware,
  zValidator('param', strategyIdSchema),
  async (c) => {
    const { userStrategyId } = c.req.valid('param')

    const result = await strategyService.getUserStrategy(userStrategyId)

    if (!result) {
      return failure(c, 'Strategy not found', 404)
    }

    return success(c, result)
  }
)
