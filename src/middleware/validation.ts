import type { NextFunction, Request, Response } from 'express'
import type { z } from 'zod'

const formatIssues = (error: z.ZodError) =>
  error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }))

export const validateBody = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatIssues(result.error),
      })
    }

    req.body = result.data
    next()
  }
}

export const validateParams = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params)

    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid params',
        details: formatIssues(result.error),
      })
    }

    next()
  }
}
