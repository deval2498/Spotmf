/**
 * Script to drop all tables and recreate them from schema
 * Run with: npx tsx scripts/reset-database.ts
 */

import { sql } from 'drizzle-orm'

import { db } from '../src/db/client.ts'

async function dropAllTables() {
  console.log('🗑️  Dropping all tables...')

  try {
    // Drop all tables in the public schema
    await db.execute(sql`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `)

    console.log('✅ All tables dropped successfully')
  } catch (error) {
    console.error('❌ Failed to drop tables:', error)
    throw error
  }
}

async function main() {
  try {
    console.log('\n========================================')
    console.log('DATABASE RESET SCRIPT')
    console.log('========================================\n')

    await dropAllTables()

    console.log('\n✅ Database reset complete!')
    console.log('Run "npm run db:push" to recreate tables from schema\n')

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Database reset failed:', error)
    process.exit(1)
  }
}

main()
