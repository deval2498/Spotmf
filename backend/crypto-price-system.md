# Task: Crypto Price Tracking and Daily Aggregation System

## 🎯 Objective

Implement a backend system that:

- Fetches cryptocurrency prices every 5 minutes.
- Stores 5-minute interval data (for the past 24 hours) in the database.
- Aggregates this intraday data once per day into daily summaries (avg, open, close, high, low).
- Maintains 1-year daily price history to support 90/180/365-day DMA calculations.
- Automatically backfills any missing daily data (from a reliable API like CoinGecko or Binance).

This implementation should follow the existing repo architecture and conventions defined in the root `claude.md`.

---

## 🧱 System Design Overview

### 🔹 Data Flow

```
[5-min Fetch Job] ──► intraday_prices ──► [Daily Aggregator Job] ──► daily_prices
```

1. **Intraday Job (every 5 min)**
   - Fetches prices for 3–4 cryptocurrencies from an external API.
   - Inserts into `intraday_prices` table.
   - Retains only the past 24 hours of data.

2. **Daily Aggregator (once per day, ~00:05 UTC)**
   - Aggregates the last 24h of 5-min data per symbol.
   - Computes: `avg_price`, `open_price`, `close_price`, `high_price`, `low_price`, and `data_points`.
   - Inserts into `daily_prices`.
   - Cleans up expired intraday data.

3. **Backfill Logic (on startup or if data missing)**
   - Checks if there’s 1 year of daily data per symbol.
   - If missing, fetches historical daily data from CoinGecko.
   - Inserts missing days into `daily_prices`.

---

## 🧩 Database Schema (Drizzle ORM)

### 🗄️ Table: `intraday_prices`

Stores 5-minute interval data for each cryptocurrency.

| Column     | Type                    | Description         |
| ---------- | ----------------------- | ------------------- |
| id         | serial / uuid           | Primary key         |
| symbol     | text                    | e.g., BTC, ETH      |
| timestamp  | timestamp               | 5-minute mark (UTC) |
| price      | decimal(18,8)           | Price at that time  |
| source     | text (nullable)         | API source name     |
| created_at | timestamp default now() | Insert timestamp    |

**Indexes**

- `(symbol, timestamp)` unique

**Retention**

- Keep only last 24h (purge old data via cron).

---

### 🗄️ Table: `daily_prices`

Stores daily aggregated data derived from `intraday_prices`.

| Column      | Type                    | Description                              |
| ----------- | ----------------------- | ---------------------------------------- |
| id          | serial / uuid           | Primary key                              |
| symbol      | text                    | e.g., BTC, ETH                           |
| date        | date                    | Trading day (UTC)                        |
| avg_price   | decimal(18,8)           | Average price across all 5-min intervals |
| open_price  | decimal(18,8)           | Price from first interval                |
| close_price | decimal(18,8)           | Price from last interval                 |
| high_price  | decimal(18,8)           | Maximum price                            |
| low_price   | decimal(18,8)           | Minimum price                            |
| data_points | integer                 | Count of records used                    |
| source      | text (nullable)         | Optional                                 |
| created_at  | timestamp default now() | Insertion time                           |

**Indexes**

- `(symbol, date)` unique

---

## ⚙️ Jobs and Scheduling

| Job                | Frequency                        | Description                                                       |
| ------------------ | -------------------------------- | ----------------------------------------------------------------- |
| **Fetch Job**      | Every 5 min                      | Fetches current price per symbol and stores in `intraday_prices`. |
| **Aggregator Job** | Once per day (00:05 UTC)         | Aggregates previous day’s 5-min data → daily_prices.              |
| **Cleanup Job**    | Once per day (after aggregation) | Deletes intraday data older than 24h.                             |
| **Backfill Check** | On startup or manually triggered | Ensures 1-year daily data completeness.                           |

All jobs should use the existing logging conventions and error handling middleware defined in the repo.  
Use `node-cron` or the repo’s scheduler pattern for periodic execution.

---

## 🧮 DMA Calculation

The stored daily data will be used for 90-day, 180-day, and 365-day DMAs.

Example SQL (for testing / analytics reference):

```sql
SELECT
  symbol,
  date,
  AVG(avg_price) OVER (PARTITION BY symbol ORDER BY date ROWS 89 PRECEDING) AS dma_90,
  AVG(avg_price) OVER (PARTITION BY symbol ORDER BY date ROWS 179 PRECEDING) AS dma_180,
  AVG(avg_price) OVER (PARTITION BY symbol ORDER BY date ROWS 364 PRECEDING) AS dma_365
FROM daily_prices
WHERE symbol = 'BTC';
```

DMAs do **not** need to be precomputed — they can be queried on-demand.

---

## 🧠 Implementation Guidelines

- Follow existing `src/jobs/`, `src/db/`, and `src/utils/` folder conventions.
- Use the project’s configured ORM (Drizzle).
- Use `fetch` or the repo’s existing API helper for external HTTP calls.
- All dates/timestamps should be stored in **UTC**.
- Handle retries and timeouts gracefully for external APIs.
- Follow existing logging + error standards defined in `claude.md`.

---

## 📅 Future Extensions (not in scope now)

- Real-time WebSocket tracking for faster updates.
- BullMQ / Redis queue integration for scalable job scheduling.
- TimescaleDB partitioning for large datasets.
- DMA precomputation table for API performance improvements.

---

## ✅ Deliverables

- Updated DB schema and migrations.
- Three new job files:
  - `fetchIntradayPrices.ts`
  - `aggregateDailyPrices.ts`
  - `backfillDailyData.ts`
- Integration into the repo’s existing scheduler.
- Verified DMA queries using `daily_prices`.

---

## 🧭 Notes for Claude

If any optimization, improvement, or inconsistency is identified (e.g., rate limits, query efficiency, schema tuning), Claude may adjust the implementation — as long as it keeps the core logic intact:

- Simplicity over complexity.
- Accuracy over premature optimization.
- Compliance with repo style and conventions.
