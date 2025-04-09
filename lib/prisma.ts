import { PrismaClient } from '@prisma/client'

// 避免在開發環境中創建多個Prisma實例
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 