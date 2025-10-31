/**
 * Test script for CoinGecko + Hyperswap dual pricing integration
 *
 * Run with: npx tsx src/services/pricing/test-pricing-integration.ts
 */

import { db } from '@/db/client.ts'
import { COINGECKO_RATE_LIMIT_DELAY, delay } from '@/lib/delay.ts'
import { HYPEREVM_POOL_CONFIGS } from '@/services/pricing/configs/pool-config.ts'
import { saveIntradayPrices } from '@/services/pricing/intraday-price-service.ts'
import { CoinGeckoPriceService } from '@/services/pricing/sources/coingecko-service.ts'
import { HyperswapPriceService } from '@/services/pricing/sources/hyperswap-service.ts'

async function testCoinGeckoService() {
  console.log('\n========================================')
  console.log('TEST 1: CoinGecko Service')
  console.log('========================================\n')

  const coinGeckoService = new CoinGeckoPriceService()

  try {
    // Test health check
    console.log('Running health check...')
    const health = await coinGeckoService.healthCheck()
    console.log('Health Status:', health.status)
    console.log('Symbols Checked:', health.symbolsChecked)
    if (health.errors.length > 0) {
      console.log('Errors:', health.errors)
    }

    // Test fetching all prices
    console.log('\nFetching all prices from CoinGecko...')
    const prices = await coinGeckoService.getAllCurrentPrices()
    console.log('Prices fetched:', prices)

    console.log('\n✅ CoinGecko Service Test PASSED\n')
    return true
  } catch (error) {
    console.error('\n❌ CoinGecko Service Test FAILED:', error)
    return false
  }
}

async function testHyperswapService() {
  console.log('\n========================================')
  console.log('TEST 2: Hyperswap Service')
  console.log('========================================\n')

  const rpcUrl = process.env.HYPEREVM_RPC_URL || 'https://rpc.hyperliquid.xyz/evm'
  const hyperswapService = new HyperswapPriceService(db, rpcUrl, HYPEREVM_POOL_CONFIGS)

  try {
    // Test health check
    console.log('Running health check...')
    const health = await hyperswapService.healthCheck()
    console.log('Health Status:', health.status)
    console.log('Pools Checked:', health.poolsChecked)
    if (health.errors.length > 0) {
      console.log('Errors:', health.errors)
    }

    // Test fetching all prices
    console.log('\nFetching all prices from Hyperswap...')
    const prices = await hyperswapService.getAllCurrentPoolPrices()
    console.log('Prices fetched:', prices)

    console.log('\n✅ Hyperswap Service Test PASSED\n')
    return true
  } catch (error) {
    console.error('\n❌ Hyperswap Service Test FAILED:', error)
    return false
  }
}

async function testDualPriceFetch() {
  console.log('\n========================================')
  console.log('TEST 3: Dual Price Fetch & Storage')
  console.log('========================================\n')

  const rpcUrl = process.env.HYPEREVM_RPC_URL || 'https://rpc.hyperliquid.xyz/evm'
  const coinGeckoService = new CoinGeckoPriceService()
  const hyperswapService = new HyperswapPriceService(db, rpcUrl, HYPEREVM_POOL_CONFIGS)

  try {
    const timestamp = new Date()
    console.log('Fetching prices from both sources...\n')

    // Fetch from Hyperswap
    let dexPrices: Record<string, number> = {}
    try {
      dexPrices = await hyperswapService.getAllCurrentPoolPrices()
      console.log('Hyperswap prices:', dexPrices)
    } catch (error) {
      console.error('Hyperswap fetch error:', error)
    }

    // Fetch from CoinGecko
    let cgPrices: Record<string, number> = {}
    try {
      cgPrices = await coinGeckoService.getAllCurrentPrices()
      console.log('CoinGecko prices:', cgPrices)
    } catch (error) {
      console.error('CoinGecko fetch error:', error)
    }

    // Compare prices
    console.log('\n--- Price Comparison ---')
    const allSymbols = new Set([...Object.keys(dexPrices), ...Object.keys(cgPrices)])
    for (const symbol of allSymbols) {
      const dexPrice = dexPrices[symbol]
      const cgPrice = cgPrices[symbol]

      if (dexPrice && cgPrice) {
        const diff = Math.abs(dexPrice - cgPrice)
        const diffPercent = ((diff / dexPrice) * 100).toFixed(2)
        console.log(
          `${symbol}: DEX=$${dexPrice.toFixed(6)}, CG=$${cgPrice.toFixed(6)}, Diff=${diffPercent}%`
        )
      } else if (dexPrice) {
        console.log(`${symbol}: DEX=$${dexPrice.toFixed(6)}, CG=N/A`)
      } else if (cgPrice) {
        console.log(`${symbol}: DEX=N/A, CG=$${cgPrice.toFixed(6)}`)
      }
    }

    // Store in database
    console.log('\n--- Storing Prices ---')
    const dexRecords = Object.entries(dexPrices).map(([asset, price]) => ({
      symbol: asset,
      price,
      timestamp,
      source: 'DEX',
    }))

    const cgRecords = Object.entries(cgPrices).map(([asset, price]) => ({
      symbol: asset,
      price,
      timestamp,
      source: 'COINGECKO',
    }))

    const allRecords = [...dexRecords, ...cgRecords]

    if (allRecords.length > 0) {
      await saveIntradayPrices(db, allRecords)
      console.log(`✅ Stored ${allRecords.length} price records in database`)
    }

    console.log('\n✅ Dual Price Fetch Test PASSED\n')
    return true
  } catch (error) {
    console.error('\n❌ Dual Price Fetch Test FAILED:', error)
    return false
  }
}

async function testDatabaseQuery() {
  console.log('\n========================================')
  console.log('TEST 4: Database Query Verification')
  console.log('========================================\n')

  try {
    // Query recent intraday prices
    const recentPrices = await db.query.intradayPrices.findMany({
      orderBy: (intradayPrices, { desc }) => [desc(intradayPrices.timestamp)],
      limit: 10,
    })

    console.log(`Found ${recentPrices.length} recent intraday prices:`)
    console.log('---')

    for (const price of recentPrices) {
      console.log(
        `${price.symbol} @ ${price.timestamp.toISOString()}: $${parseFloat(price.price).toFixed(6)} [${price.source}]`
      )
    }

    // Group by source
    const sources = recentPrices.reduce(
      (acc, price) => {
        const src = price.source || 'UNKNOWN'
        acc[src] = (acc[src] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    console.log('\n--- Price Count by Source ---')
    for (const [source, count] of Object.entries(sources)) {
      console.log(`${source}: ${count} prices`)
    }

    // Query daily prices
    const recentDaily = await db.query.dailyPrices.findMany({
      orderBy: (dailyPrices, { desc }) => [desc(dailyPrices.date)],
      limit: 5,
    })

    console.log(`\nFound ${recentDaily.length} recent daily prices:`)
    console.log('---')

    for (const price of recentDaily) {
      console.log(
        `${price.symbol} on ${price.date}: avg=$${parseFloat(price.avgPrice).toFixed(2)}, points=${price.dataPoints} [${price.source}]`
      )
    }

    console.log('\n✅ Database Query Test PASSED\n')
    return true
  } catch (error) {
    console.error('\n❌ Database Query Test FAILED:', error)
    return false
  }
}

async function runAllTests() {
  console.log('\n')
  console.log('╔════════════════════════════════════════╗')
  console.log('║  DUAL PRICING SYSTEM INTEGRATION TEST  ║')
  console.log('╚════════════════════════════════════════╝')

  const results = {
    coinGecko: false,
    hyperswap: false,
    dualFetch: false,
    database: false,
  }

  try {
    // Test 1: CoinGecko
    results.coinGecko = await testCoinGeckoService()

    // Add delay to avoid rate limiting
    console.log(
      `\n⏳ Waiting ${COINGECKO_RATE_LIMIT_DELAY / 1000}s to avoid rate limiting...\n`
    )
    await delay(COINGECKO_RATE_LIMIT_DELAY)

    // Test 2: Hyperswap
    results.hyperswap = await testHyperswapService()

    // Add delay to avoid rate limiting
    console.log(
      `\n⏳ Waiting ${COINGECKO_RATE_LIMIT_DELAY / 1000}s to avoid rate limiting...\n`
    )
    await delay(COINGECKO_RATE_LIMIT_DELAY)

    // Test 3: Dual Fetch
    results.dualFetch = await testDualPriceFetch()

    // Test 4: Database (no delay needed)
    results.database = await testDatabaseQuery()

    console.log('\n========================================')
    console.log('TEST SUMMARY')
    console.log('========================================\n')
    console.log(`CoinGecko Service:    ${results.coinGecko ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`Hyperswap Service:    ${results.hyperswap ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`Dual Price Fetch:     ${results.dualFetch ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`Database Query:       ${results.database ? '✅ PASS' : '❌ FAIL'}`)

    const allPassed = Object.values(results).every((r) => r)
    console.log(`\n${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`)

    process.exit(allPassed ? 0 : 1)
  } catch (error) {
    console.error('\n❌ Test execution failed:', error)
    process.exit(1)
  }
}

// Run tests
runAllTests()
