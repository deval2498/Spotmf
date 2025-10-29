import type { Context } from 'hono'

export function success<T>(c: Context, data: T, status = 200) {
  return c.json({ data }, status as 200 | 201)
}

export function failure(c: Context, message: string, status = 400) {
  return c.json({ error: message }, status as 400 | 401 | 403 | 404 | 500)
}
