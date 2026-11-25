import type { Response } from 'express'
import { prisma } from '../db/connection.ts'
import type { AuthenticatedRequest } from '../middleware/auth.ts'

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      omit: { password: true },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user })
  } catch (error) {
    console.error('Get profile error', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
}
