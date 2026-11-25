import { Router } from 'express'
import {
  completeHabit,
  createHabit,
  deleteHabit,
  getHabitById,
  getUserHabits,
  updateHabit,
} from '../controllers/habitController.ts'
import {
  completeHabitSchema,
  createHabitSchema,
  habitParamsSchema,
  updateHabitSchema,
} from '../db/validation.ts'
import { authenticateToken } from '../middleware/auth.ts'
import { validateBody, validateParams } from '../middleware/validation.ts'

const router = Router()

router.use(authenticateToken)

router.get('/', getUserHabits)
router.post('/', validateBody(createHabitSchema), createHabit)
router.get('/:id', validateParams(habitParamsSchema), getHabitById)
router.patch(
  '/:id',
  validateParams(habitParamsSchema),
  validateBody(updateHabitSchema),
  updateHabit,
)
router.delete('/:id', validateParams(habitParamsSchema), deleteHabit)
router.post(
  '/:id/complete',
  validateParams(habitParamsSchema),
  validateBody(completeHabitSchema),
  completeHabit,
)

export default router
