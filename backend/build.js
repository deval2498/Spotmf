import * as esbuild from 'esbuild'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const baseConfig = {
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  sourcemap: true,
  minify: process.env.NODE_ENV === 'production',
  external: [
    'drizzle-orm',
    '@neondatabase/serverless',
    'ethers',
    'hono',
    'jsonwebtoken',
    'viem',
    'dotenv',
  ],
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}

async function build() {
  try {
    console.log('🔨 Building with esbuild...')

    // Build main server
    await esbuild.build({
      ...baseConfig,
      entryPoints: ['src/main.ts'],
      outfile: 'dist/main.js',
    })

    // Build worker
    await esbuild.build({
      ...baseConfig,
      entryPoints: ['src/worker.ts'],
      outfile: 'dist/worker.js',
    })

    console.log('✅ Build completed successfully!')
  } catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}

build()
