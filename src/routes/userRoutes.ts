import { Router } from 'express'
import { getProfile } from '../controllers/userController.ts'
import { authenticateToken } from '../middleware/auth.ts'

const router = Router()

router.use(authenticateToken)

router.get('/me', getProfile)

export default router
