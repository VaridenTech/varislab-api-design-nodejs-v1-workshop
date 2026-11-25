import type { Response } from 'express'
import { prisma } from '../db/connection.ts'
import type {
  CompleteHabitInput,
  CreateHabitInput,
  HabitParams,
  UpdateHabitInput,
} from '../db/validation.ts'
import type { Prisma, Tag } from '../generated/prisma/client.ts'
import type { AuthenticatedRequest } from '../middleware/auth.ts'
import { APIError } from '../middleware/errorHandler.ts'

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
}

export const getUserHabits = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const habits = await prisma.habit.findMany({
    where: { userId: req.user!.id },
    include: withTags,
    orderBy: { createdAt: 'desc' },
  })

  res.json({ habits: habits.map(formatHabit) })
}

export const getHabitById = async (
  req: AuthenticatedRequest<HabitParams>,
  res: Response,
) => {
  const habit = await prisma.habit.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
    include: {
      ...withTags,
      entries: { orderBy: { completionDate: 'desc' }, take: 10 },
    },
  })

  if (!habit) {
    throw new APIError(404, 'Habit not found')
  }

  res.json({ habit: formatHabit(habit) })
}

export const updateHabit = async (
  req: AuthenticatedRequest<HabitParams, UpdateHabitInput>,
  res: Response,
) => {
  const { id } = req.params
  const userId = req.user!.id
  const { tagIds, ...updates } = req.body

  const habit = await prisma.$transaction(async (tx) => {
    await tx.habit.update({
      where: { id, userId },
      data: updates,
    })

    if (tagIds !== undefined) {
      await tx.habitTag.deleteMany({ where: { habitId: id } })

      if (tagIds.length > 0) {
        await tx.habitTag.createMany({
          data: tagIds.map((tagId) => ({ habitId: id, tagId })),
        })
      }
    }

    return tx.habit.findUniqueOrThrow({
      where: { id },
      include: withTags,
    })
  })

  res.json({ message: 'Habit updated', habit: formatHabit(habit) })
}

export const deleteHabit = async (
  req: AuthenticatedRequest<HabitParams>,
  res: Response,
) => {
  await prisma.habit.delete({
    where: { id: req.params.id, userId: req.user!.id },
  })

  res.status(204).send()
}

export const completeHabit = async (
  req: AuthenticatedRequest<HabitParams, CompleteHabitInput>,
  res: Response,
) => {
  const habit = await prisma.habit.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
  })

  if (!habit) {
    throw new APIError(404, 'Habit not found')
  }

  const entry = await prisma.entry.create({
    data: { habitId: habit.id, note: req.body.note },
  })

  res.status(201).json({ message: 'Habit completed', entry })
}
