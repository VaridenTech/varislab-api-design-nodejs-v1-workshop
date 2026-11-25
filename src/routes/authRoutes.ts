import { Router } from 'express'

const router = Router()

router.post('/register', (req, res) => {
  res.status(201).json({ message: 'user registered' })
})

router.post('/login', (req, res) => {
  res.json({ message: 'user logged in' })
})

export default router
