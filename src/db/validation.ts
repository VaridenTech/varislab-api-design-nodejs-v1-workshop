import { z } from 'zod'

export const registerSchema = z.object({
  email: z.email('Invalid email').max(255),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72),
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
})

export const loginSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export const createHabitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  targetCount: z.number().int().positive().optional(),
  tagIds: z.array(z.uuid('Invalid tag ID')).optional(),
})

export const updateHabitSchema = createHabitSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export const completeHabitSchema = z
  .object({
    note: z.string().max(500).optional(),
  })
  .default({})

export const habitParamsSchema = z.object({
  id: z.uuid('Invalid habit ID'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CreateHabitInput = z.infer<typeof createHabitSchema>
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>
export type CompleteHabitInput = z.infer<typeof completeHabitSchema>
export type HabitParams = z.infer<typeof habitParamsSchema>
