import { prisma } from './db'

export async function getStats(userId: string) {
  const userCount = await prisma.user.count()
  return {
    userCount,
    revenue: 12500,
    activePlans: 42,
  }
}
