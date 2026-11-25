import { prisma } from '../../src/db/connection.ts'
import { generateToken } from '../../src/utils/jwt.ts'
import { hashPassword } from '../../src/utils/password.ts'

let counter = 0

export const createTestUser = async () => {
  counter += 1
  const password = 'testpassword123'

  const user = await prisma.user.create({
    data: {
      email: `test-${Date.now()}-${counter}@example.com`,
      username: `testuser-${Date.now()}-${counter}`,
      password: await hashPassword(password),
    },
  })

  const token = await generateToken({
    id: user.id,
    email: user.email,
    username: user.username,
  })

  return { user, token, password }
}

export const createTestHabit = async (userId: string, name = 'Test habit') => {
  return prisma.habit.create({
    data: { userId, name, frequency: 'daily' },
  })
}

export const cleanupDatabase = async () => {
  await prisma.tag.deleteMany()
  await prisma.user.deleteMany()
}
