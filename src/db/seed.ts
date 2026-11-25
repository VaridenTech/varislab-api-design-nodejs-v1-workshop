import { hashPassword } from '../utils/password.ts'
import { prisma } from './connection.ts'

const seed = async () => {
  console.log('Clearing existing data...')
  await prisma.tag.deleteMany()
  await prisma.user.deleteMany()

  console.log('Creating demo user...')
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@habittracker.com',
      username: 'demouser',
      password: await hashPassword('demo12345'),
      firstName: 'Demo',
      lastName: 'User',
    },
  })

  console.log('Creating tags...')
  const healthTag = await prisma.tag.create({
    data: { name: 'Health', color: '#10B981' },
  })
  const learningTag = await prisma.tag.create({
    data: { name: 'Learning', color: '#3B82F6' },
  })

  console.log('Creating habits...')
  const exerciseHabit = await prisma.habit.create({
    data: {
      userId: demoUser.id,
      name: 'Exercise',
      description: 'Daily workout routine',
      frequency: 'daily',
      targetCount: 1,
    },
  })
  const readingHabit = await prisma.habit.create({
    data: {
      userId: demoUser.id,
      name: 'Read 20 pages',
      frequency: 'daily',
    },
  })

  await prisma.habitTag.createMany({
    data: [
      { habitId: exerciseHabit.id, tagId: healthTag.id },
      { habitId: readingHabit.id, tagId: learningTag.id },
    ],
  })

  console.log('Creating entries...')
  const today = new Date()
  today.setHours(12, 0, 0, 0)

  for (let i = 0; i < 7; i++) {
    const completionDate = new Date(today)
    completionDate.setDate(completionDate.getDate() - i)

    await prisma.entry.create({
      data: {
        habitId: exerciseHabit.id,
        completionDate,
        note: i === 0 ? 'Great workout today!' : null,
      },
    })
  }

  console.log('Database seeded')
  console.log(`Users: ${await prisma.user.count()}`)
  console.log(`Habits: ${await prisma.habit.count()}`)
  console.log(`Entries: ${await prisma.entry.count()}`)
  console.log(`Tags: ${await prisma.tag.count()}`)
}

try {
  await seed()
} catch (error) {
  console.error('Seed failed', error)
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
