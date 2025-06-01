import { PrismaClient, Prisma } from '@prisma/client'

export class DatabaseService {
  private static instance: DatabaseService
  private prismaClient: PrismaClient

  private constructor() {
    this.prismaClient = new PrismaClient({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'error', 'warn'] 
        : ['error'],
      errorFormat: 'pretty'
    })
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  public getClient(): PrismaClient {
    return this.prismaClient
  }

  public async connect(): Promise<void> {
    try {
      await this.prismaClient.$connect()
      console.log('✅ Database connected successfully')
    } catch (error) {
      console.error('❌ Database connection failed:', error)
      throw error
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.prismaClient.$disconnect()
      console.log('✅ Database disconnected successfully')
    } catch (error) {
      console.error('❌ Database disconnection failed:', error)
      throw error
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.prismaClient.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      console.error('❌ Database health check failed:', error)
      return false
    }
  }
}

// Export singleton instance for easy access
export const db = DatabaseService.getInstance()
export const prisma = db.getClient()