import { Router } from 'express'
import { z } from 'zod'
import { validateBody, validateParams } from '../middleware/validation.ts'

const createHabitSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  targetCount: z.number().int().positive().optional(),
})

const habitParamsSchema = z.object({
  id: z.uuid('Invalid habit ID'),
})

const router = Router()

router.get('/', (req, res) => {
  res.json({ message: 'habits' })
})

router.post('/', validateBody(createHabitSchema), (req, res) => {
  res.status(201).json({ message: 'created habit', habit: req.body })
})

router.get('/:id', validateParams(habitParamsSchema), (req, res) => {
  res.json({ message: `got habit ${req.params.id}` })
})

router.patch('/:id', validateParams(habitParamsSchema), (req, res) => {
  res.json({ message: `updated habit ${req.params.id}` })
})

router.delete('/:id', validateParams(habitParamsSchema), (req, res) => {
  res.json({ message: `deleted habit ${req.params.id}` })
})

router.post('/:id/complete', validateParams(habitParamsSchema), (req, res) => {
  res.status(201).json({ message: `completed habit ${req.params.id}` })
})

export default router
