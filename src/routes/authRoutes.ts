import { Router } from 'express'
import { register } from '../controllers/authController.ts'
import { registerSchema } from '../db/validation.ts'
import { validateBody } from '../middleware/validation.ts'

const router = Router()

router.post('/register', validateBody(registerSchema), register)

router.post('/login', (req, res) => {
  res.json({ message: 'user logged in' })
})

export default router
