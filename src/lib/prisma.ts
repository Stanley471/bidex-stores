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

// Reuse pg.Pool across module evaluations to prevent connection limit exhaustion
const isSupabase = connectionString.includes('supabase') || connectionString.includes('pooler')
const pool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    max: 10, // Allow up to 10 connections for concurrent SSR data queries
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 15000, // Allow up to 15s connection acquisition window under burst load
  })

globalForPrisma.pgPool = pool

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

// Reset stale cached Prisma client on globalThis if newly added models/fields (like order messages) are missing
const SCHEMA_VERSION = '2026_09_09_order_messages'
const globalWithVersion = globalThis as typeof globalThis & {
  __PRISMA_SCHEMA_VERSION__?: string
}

if (globalForPrisma.prisma && globalWithVersion.__PRISMA_SCHEMA_VERSION__ !== SCHEMA_VERSION) {
  globalForPrisma.prisma = undefined
  globalWithVersion.__PRISMA_SCHEMA_VERSION__ = SCHEMA_VERSION
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

globalForPrisma.prisma = prisma

export default prisma
