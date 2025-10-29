import { Hono } from 'hono'
import { logger as honoLogger } from 'hono/logger'

import { createApiRouter } from '@/api/index.ts'
import { env, validateEnv } from '@/lib/env.ts'
import { logger } from '@/lib/logger.ts'
import { corsMiddleware } from '@/middleware/cors.ts'
import { errorHandler, notFoundHandler } from '@/middleware/error-handler.ts'

validateEnv()

const app = new Hono()

app.use('*', honoLogger())
app.use('*', corsMiddleware)
app.use('*', errorHandler)

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})

app.route('/api', createApiRouter)

app.notFound(notFoundHandler)

const port = parseInt(env.PORT)

logger.info(`🚀 Server starting on port ${port}`)
logger.info(`📱 Health check: http://localhost:${port}/health`)
logger.info(`🔐 Auth API: http://localhost:${port}/api/auth`)
logger.info(`📊 Strategy API: http://localhost:${port}/api/strategy`)

export default {
  port,
  fetch: app.fetch,
}
