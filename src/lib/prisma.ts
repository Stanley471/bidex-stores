import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient
  pgPool?: Pool
}

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set.')
}

// Reset stale cached Prisma client and pg.Pool on globalThis if version changes or schema is updated
const SCHEMA_VERSION = '2026_09_13_bank_transfer'
const globalWithVersion = globalThis as typeof globalThis & {
  __PRISMA_SCHEMA_VERSION__?: string
}

if (globalWithVersion.__PRISMA_SCHEMA_VERSION__ !== SCHEMA_VERSION) {
  if (globalForPrisma.pgPool) {
    try {
      globalForPrisma.pgPool.end().catch(() => {})
    } catch {
      // Ignore cleanup error
    }
    globalForPrisma.pgPool = undefined
  }
  globalForPrisma.prisma = undefined
  globalWithVersion.__PRISMA_SCHEMA_VERSION__ = SCHEMA_VERSION
}

// Reuse pg.Pool across module evaluations to prevent connection limit exhaustion
const isSupabase = connectionString.includes('supabase') || connectionString.includes('pooler')
const isDev = process.env.NODE_ENV !== 'production'
const pool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    max: isDev ? 3 : 10, // Avoid exhausting Supabase free tier 15-connection limit in dev
    idleTimeoutMillis: 10000, // Release idle clients after 10 seconds
    connectionTimeoutMillis: 15000, // Allow up to 15s connection acquisition window under burst load
  })

pool.on('error', (err) => {
  console.warn('PostgreSQL pool background client error:', err.message)
})

globalForPrisma.pgPool = pool

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

globalForPrisma.prisma = prisma

export default prisma
