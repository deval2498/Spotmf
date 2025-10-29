import { relations } from 'drizzle-orm'
import {
  bigint,
  boolean,
  date,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core'

// Enums
export const strategyTypeEnum = pgEnum('STRATEGY_TYPE', ['DCA', 'DCA_WITH_DMA'])

export const assetTypeEnum = pgEnum('ASSET_TYPE', ['BTC', 'ETH', 'HYPE'])

export const dmaStatusEnum = pgEnum('DMA_STATUS', ['ABOVE', 'BELOW'])

export const strategyStatusEnum = pgEnum('STRATEGY_STATUS', [
  'PENDING',
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'FAILED',
])

export const executionStatusEnum = pgEnum('EXECUTION_STATUS', [
  'PENDING',
  'EXECUTING',
  'SUCCESS',
  'FAILED',
  'RETRYING',
])

// Tables
export const users = pgTable(
  'users',
  {
    id: varchar('id', { length: 191 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    walletAddress: varchar('wallet_address', { length: 42 }).notNull().unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    email: varchar('email', { length: 255 }),
    name: varchar('name', { length: 100 }),
    profileImage: varchar('profile_image'),
    isActive: boolean('is_active').notNull().default(true),
  },
  (table) => ({
    walletAddressIdx: index('users_wallet_address_idx').on(table.walletAddress),
  })
)

export const authNonces = pgTable(
  'auth_nonces',
  {
    walletAddress: varchar('wallet_address', { length: 42 }).primaryKey().notNull(),
    nonce: varchar('nonce', { length: 64 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    expiresAtIdx: index('auth_nonces_expires_at_idx').on(table.expiresAt),
  })
)

export const actionNonces = pgTable(
  'action_nonces',
  {
    id: varchar('id', { length: 191 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    walletAddress: varchar('wallet_address', { length: 42 }).notNull(),
    nonce: varchar('nonce', { length: 64 }).notNull().unique(),
    action: varchar('action', { length: 100 }).notNull(),
    strategyType: strategyTypeEnum('strategy_type').notNull(),
    asset: assetTypeEnum('asset').notNull(),
    intervalAmount: bigint('interval_amount', { mode: 'bigint' }).notNull(),
    intervalDays: integer('interval_days').notNull(),
    acceptedSlippage: decimal('accepted_slippage', { precision: 5, scale: 2 }).notNull(),
    totalAmount: bigint('total_amount', { mode: 'bigint' }).notNull(),
    strategyId: varchar('strategy_id', { length: 191 }),
    expiresAt: timestamp('expires_at').notNull(),
    used: boolean('used').notNull().default(false),
    usedAt: timestamp('used_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    walletUsedIdx: index('action_nonces_wallet_used_idx').on(
      table.walletAddress,
      table.used
    ),
    expiresUsedIdx: index('action_nonces_expires_used_idx').on(
      table.expiresAt,
      table.used
    ),
    nonceIdx: index('action_nonces_nonce_idx').on(table.nonce),
  })
)

export const userStrategies = pgTable(
  'user_strategies',
  {
    id: varchar('id', { length: 191 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    walletAddress: varchar('wallet_address', { length: 42 }).notNull(),
    actionNonceId: varchar('action_nonce_id', { length: 191 }).notNull().unique(),
    txHash: varchar('tx_hash_approval'),
    status: strategyStatusEnum('status').notNull().default('PENDING'),
    isActive: boolean('is_active').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    lastExecutedAt: timestamp('last_executed_at'),
    nextExecutionAt: timestamp('next_execution_at'),
    totalExecutions: integer('total_executions').notNull().default(0),
    totalAmountSwapped: bigint('total_amount_swapped', { mode: 'bigint' })
      .notNull()
      .default(BigInt(0)),
  },
  (table) => ({
    walletActiveIdx: index('user_strategies_wallet_active_idx').on(
      table.walletAddress,
      table.isActive
    ),
    statusNextExecIdx: index('user_strategies_status_next_exec_idx').on(
      table.status,
      table.nextExecutionAt
    ),
  })
)

export const strategyExecutions = pgTable(
  'strategy_executions',
  {
    id: varchar('id', { length: 191 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    strategyId: varchar('strategy_id', { length: 191 }).notNull(),
    executedAt: timestamp('executed_at').notNull().defaultNow(),
    transactionHash: varchar('transaction_hash'),
    status: executionStatusEnum('status').notNull().default('PENDING'),
    amountIn: bigint('amount_in', { mode: 'bigint' }).notNull(),
    amountOut: bigint('amount_out', { mode: 'bigint' }),
    actualSlippage: decimal('actual_slippage', { precision: 5, scale: 2 }),
    gasUsed: bigint('gas_used', { mode: 'bigint' }),
    gasPriceUsed: bigint('gas_price_used', { mode: 'bigint' }),
    errorMessage: varchar('error_message'),
    retryCount: integer('retry_count').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    strategyExecutedIdx: index('strategy_executions_strategy_executed_idx').on(
      table.strategyId,
      table.executedAt
    ),
    statusExecutedIdx: index('strategy_executions_status_executed_idx').on(
      table.status,
      table.executedAt
    ),
    txHashIdx: index('strategy_executions_tx_hash_idx').on(table.transactionHash),
  })
)

export const dmaStatuses = pgTable(
  'dma_status',
  {
    id: varchar('id', { length: 191 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    asset: assetTypeEnum('asset').notNull(),
    currentPrice: varchar('current_price', { length: 50 }).notNull(),
    dma200: varchar('dma_200', { length: 50 }).notNull(),
    status: dmaStatusEnum('status').notNull(),
    calculatedAt: timestamp('calculated_at').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    assetIdx: index('dma_status_asset_idx').on(table.asset),
    calculatedAtIdx: index('dma_status_calculated_at_idx').on(table.calculatedAt),
    assetCalculatedUnique: unique('dma_status_asset_calculated_unique').on(
      table.asset,
      table.calculatedAt
    ),
  })
)

export const failedTransactionLogs = pgTable(
  'failed_transaction_logs',
  {
    id: varchar('id', { length: 191 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    walletAddress: varchar('wallet_address', { length: 42 }).notNull(),
    strategyId: varchar('strategy_id', { length: 191 }).notNull(),
    executionId: varchar('execution_id', { length: 191 }),
    asset: assetTypeEnum('asset').notNull(),
    transactionHash: varchar('transaction_hash'),
    amount: varchar('amount', { length: 50 }).notNull(),
    planType: strategyTypeEnum('plan_type').notNull(),
    errorMessage: text('error_message'),
    failedAt: timestamp('failed_at').notNull().defaultNow(),
    alertSent: boolean('alert_sent').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    walletIdx: index('failed_transaction_logs_wallet_idx').on(table.walletAddress),
    failedAtIdx: index('failed_transaction_logs_failed_at_idx').on(table.failedAt),
    alertSentIdx: index('failed_transaction_logs_alert_sent_idx').on(table.alertSent),
  })
)

export const priceCache = pgTable(
  'price_cache',
  {
    id: varchar('id', { length: 191 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    asset: assetTypeEnum('asset').notNull(),
    price: varchar('price', { length: 50 }).notNull(),
    source: varchar('source', { length: 20 }).notNull(),
    timestamp: timestamp('timestamp').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    assetTimestampIdx: index('price_cache_asset_timestamp_idx').on(
      table.asset,
      table.timestamp
    ),
    assetSourceIdx: index('price_cache_asset_source_idx').on(table.asset, table.source),
  })
)

export const historicalPrices = pgTable(
  'historical_prices',
  {
    id: varchar('id', { length: 191 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    asset: assetTypeEnum('asset').notNull(),
    date: date('date').notNull(),
    price: varchar('price', { length: 50 }).notNull(),
    source: varchar('source', { length: 20 }).notNull().default('UNISWAP_V3'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    assetIdx: index('historical_prices_asset_idx').on(table.asset),
    dateIdx: index('historical_prices_date_idx').on(table.date),
    assetDateUnique: unique('historical_prices_asset_date_unique').on(
      table.asset,
      table.date
    ),
  })
)

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  actionNonces: many(actionNonces),
  strategies: many(userStrategies),
}))

export const actionNoncesRelations = relations(actionNonces, ({ one }) => ({
  user: one(users, {
    fields: [actionNonces.walletAddress],
    references: [users.walletAddress],
  }),
  userStrategy: one(userStrategies, {
    fields: [actionNonces.id],
    references: [userStrategies.actionNonceId],
  }),
}))

export const userStrategiesRelations = relations(userStrategies, ({ one, many }) => ({
  user: one(users, {
    fields: [userStrategies.walletAddress],
    references: [users.walletAddress],
  }),
  actionNonce: one(actionNonces, {
    fields: [userStrategies.actionNonceId],
    references: [actionNonces.id],
  }),
  executions: many(strategyExecutions),
  failedTransactionLogs: many(failedTransactionLogs),
}))

export const strategyExecutionsRelations = relations(strategyExecutions, ({ one }) => ({
  strategy: one(userStrategies, {
    fields: [strategyExecutions.strategyId],
    references: [userStrategies.id],
  }),
}))

export const failedTransactionLogsRelations = relations(
  failedTransactionLogs,
  ({ one }) => ({
    strategy: one(userStrategies, {
      fields: [failedTransactionLogs.strategyId],
      references: [userStrategies.id],
    }),
  })
)

// Type exports for use in services
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type AuthNonce = typeof authNonces.$inferSelect
export type NewAuthNonce = typeof authNonces.$inferInsert

export type ActionNonce = typeof actionNonces.$inferSelect
export type NewActionNonce = typeof actionNonces.$inferInsert

export type UserStrategy = typeof userStrategies.$inferSelect
export type NewUserStrategy = typeof userStrategies.$inferInsert

export type StrategyExecution = typeof strategyExecutions.$inferSelect
export type NewStrategyExecution = typeof strategyExecutions.$inferInsert

export type DmaStatus = typeof dmaStatuses.$inferSelect
export type NewDmaStatus = typeof dmaStatuses.$inferInsert

export type FailedTransactionLog = typeof failedTransactionLogs.$inferSelect
export type NewFailedTransactionLog = typeof failedTransactionLogs.$inferInsert

export type PriceCache = typeof priceCache.$inferSelect
export type NewPriceCache = typeof priceCache.$inferInsert

export type HistoricalPrice = typeof historicalPrices.$inferSelect
export type NewHistoricalPrice = typeof historicalPrices.$inferInsert
