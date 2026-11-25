import type { Response } from 'express'
import { prisma } from '../db/connection.ts'
import type { AuthenticatedRequest } from '../middleware/auth.ts'
import { APIError } from '../middleware/errorHandler.ts'

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    omit: { password: true },
  })

  if (!user) {
    throw new APIError(404, 'User not found')
  }

  res.json({ user })
}
