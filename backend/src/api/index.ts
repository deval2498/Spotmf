import { Hono } from 'hono'

import { authRoutes } from './auth/index.ts'
import { strategyRoutes } from './strategy/index.ts'

export const apiRoutes = new Hono()

apiRoutes.route('/auth', authRoutes)
apiRoutes.route('/strategy', strategyRoutes)

export { apiRoutes as createApiRouter }
