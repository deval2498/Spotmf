import { config } from 'dotenv'

config()

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  PORT: process.env.PORT || '3000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_DOMAIN: process.env.APP_DOMAIN || 'localhost:3000',
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  ALLOWED_CHAIN_IDS: process.env.ALLOWED_CHAIN_IDS || '1,137,8453',
} as const

export function validateEnv() {
  const required = ['DATABASE_URL', 'JWT_SECRET']
  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

export function getAllowedChainIds(): number[] {
  return env.ALLOWED_CHAIN_IDS.split(',').map((id) => parseInt(id.trim(), 10))
}
