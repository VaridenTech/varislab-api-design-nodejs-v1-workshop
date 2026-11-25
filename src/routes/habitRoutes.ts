import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
  res.json({ message: 'habits' })
})

router.post('/', (req, res) => {
  res.status(201).json({ message: 'created habit', habit: req.body })
})

router.get('/:id', (req, res) => {
  res.json({ message: `got habit ${req.params.id}` })
})

router.patch('/:id', (req, res) => {
  res.json({ message: `updated habit ${req.params.id}` })
})

router.delete('/:id', (req, res) => {
  res.json({ message: `deleted habit ${req.params.id}` })
})

router.post('/:id/complete', (req, res) => {
  res.status(201).json({ message: `completed habit ${req.params.id}` })
})

export default router
