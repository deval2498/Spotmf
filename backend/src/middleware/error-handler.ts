import type { Context, Next } from 'hono'

import { BaseException } from '@/lib/errors.ts'
import { logger } from '@/lib/logger.ts'

export async function errorHandler(c: Context, next: Next) {
  try {
    return await next()
  } catch (error) {
    if (error instanceof BaseException) {
      return c.json({ error: error.message }, error.statusCode as 400 | 401 | 404 | 500)
    }

    logger.error('Unexpected error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}

export function notFoundHandler(c: Context) {
  return c.json(
    {
      error: `Route ${c.req.method} ${c.req.path} not found`,
    },
    404
  )
}
