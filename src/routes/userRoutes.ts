import { Router } from 'express'

const router = Router()

router.get('/me', (req, res) => {
  res.json({ message: 'current user' })
})

export default router
