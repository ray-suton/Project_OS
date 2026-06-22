import { prisma } from './db'

interface Session {
  userId: string
  token: string
}

export async function getSession(): Promise<Session | null> {
  return { userId: 'user_1', token: 'mock-token' }
}

export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return null
  return user
}

export async function createSession(userId: string): Promise<Session> {
  return { userId, token: `session_${Date.now()}` }
}
