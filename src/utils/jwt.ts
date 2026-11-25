import { SignJWT } from 'jose'
import { env } from '../../env.ts'

export interface JwtPayload {
  id: string
  email: string
  username: string
}

const secretKey = new TextEncoder().encode(env.JWT_SECRET)

export const generateToken = (payload: JwtPayload): Promise<string> => {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(secretKey)
}
