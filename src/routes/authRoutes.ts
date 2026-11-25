import { Router } from 'express'
import { login, register } from '../controllers/authController.ts'
import { loginSchema, registerSchema } from '../db/validation.ts'
import { validateBody } from '../middleware/validation.ts'

const router = Router()

router.post('/register', validateBody(registerSchema), register)
router.post('/login', validateBody(loginSchema), login)

export default router
