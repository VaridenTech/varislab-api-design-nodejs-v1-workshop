import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { isTest } from '../env.ts'
import { prisma } from './db/connection.ts'
import { errorHandler, notFound } from './middleware/errorHandler.ts'
import authRoutes from './routes/authRoutes.ts'
import habitRoutes from './routes/habitRoutes.ts'
import userRoutes from './routes/userRoutes.ts'

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(morgan('dev', { skip: () => isTest() }))

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`

    res.status(200).json({
      status: 'OK',
      database: 'connected',
      timestamp: new Date().toISOString(),
      service: 'Habit Tracker API',
    })
  } catch {
    res.status(503).json({
      status: 'unavailable',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
      service: 'Habit Tracker API',
    })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/habits', habitRoutes)
app.use('/api/users', userRoutes)

app.use(notFound)
app.use(errorHandler)

export { app }

export default app
