import { Router } from 'express'
import {
  createHabit,
  getHabitById,
  getUserHabits,
} from '../controllers/habitController.ts'
import { createHabitSchema, habitParamsSchema } from '../db/validation.ts'
import { authenticateToken } from '../middleware/auth.ts'
import { validateBody, validateParams } from '../middleware/validation.ts'

const router = Router()

router.use(authenticateToken)

router.get('/', getUserHabits)
router.post('/', validateBody(createHabitSchema), createHabit)
router.get('/:id', validateParams(habitParamsSchema), getHabitById)

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
