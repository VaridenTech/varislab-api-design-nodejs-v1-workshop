import type { Response } from 'express'
import { prisma } from '../db/connection.ts'
import type { CreateHabitInput, HabitParams } from '../db/validation.ts'
import { Prisma, type Tag } from '../generated/prisma/client.ts'
import type { AuthenticatedRequest } from '../middleware/auth.ts'

const withTags = {
  habitTags: { include: { tag: true } },
} satisfies Prisma.HabitInclude

const formatHabit = <T extends { habitTags: { tag: Tag }[] }>(habit: T) => {
  const { habitTags, ...rest } = habit

  return {
    ...rest,
    tags: habitTags.map((habitTag) => habitTag.tag),
  }
}

export const createHabit = async (
  req: AuthenticatedRequest<{}, CreateHabitInput>,
  res: Response,
) => {
  try {
    const { tagIds, ...habitData } = req.body
    const userId = req.user!.id

    const habit = await prisma.$transaction(async (tx) => {
      const newHabit = await tx.habit.create({
        data: { ...habitData, userId },
      })

      if (tagIds && tagIds.length > 0) {
        await tx.habitTag.createMany({
          data: tagIds.map((tagId) => ({ habitId: newHabit.id, tagId })),
        })
      }

      return tx.habit.findUniqueOrThrow({
        where: { id: newHabit.id },
        include: withTags,
      })
    })

    res.status(201).json({ message: 'Habit created', habit: formatHabit(habit) })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return res.status(400).json({ error: 'One or more tags do not exist' })
    }

    console.error('Create habit error', error)
    res.status(500).json({ error: 'Failed to create habit' })
  }
}

export const getUserHabits = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const habits = await prisma.habit.findMany({
      where: { userId: req.user!.id },
      include: withTags,
      orderBy: { createdAt: 'desc' },
    })

    res.json({ habits: habits.map(formatHabit) })
  } catch (error) {
    console.error('Get habits error', error)
    res.status(500).json({ error: 'Failed to fetch habits' })
  }
}

export const getHabitById = async (
  req: AuthenticatedRequest<HabitParams>,
  res: Response,
) => {
  try {
    const habit = await prisma.habit.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: {
        ...withTags,
        entries: { orderBy: { completionDate: 'desc' }, take: 10 },
      },
    })

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' })
    }

    res.json({ habit: formatHabit(habit) })
  } catch (error) {
    console.error('Get habit error', error)
    res.status(500).json({ error: 'Failed to fetch habit' })
  }
}
