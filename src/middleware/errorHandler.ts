import type { NextFunction, Request, Response } from 'express'
import { isDev } from '../../env.ts'
import { Prisma } from '../generated/prisma/client.ts'

export class APIError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'APIError'
    this.status = status
  }
}

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  next(new APIError(404, `Cannot ${req.method} ${req.originalUrl}`))
}

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) {
    return next(err)
  }

  if (err instanceof APIError) {
    return res.status(err.status).json({ error: err.message })
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Resource already exists' })
    }

    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'Related resource does not exist' })
    }

    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Resource not found' })
    }
  }

  if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
    return res.status(400).json({ error: 'Invalid JSON in request body' })
  }

  console.error(err)

  res.status(500).json({
    error: 'Internal server error',
    ...(isDev() && err instanceof Error && { stack: err.stack }),
  })
}
