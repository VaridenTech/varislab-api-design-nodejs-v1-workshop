import type { NextFunction, Request, Response } from 'express'
import { type JwtPayload, verifyToken } from '../utils/jwt.ts'

export interface AuthenticatedRequest<Params = {}, ReqBody = unknown>
  extends Request<Params, unknown, ReqBody> {
  user?: JwtPayload
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const [scheme, token] = req.headers.authorization?.split(' ') ?? []

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  try {
    req.user = await verifyToken(token)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
