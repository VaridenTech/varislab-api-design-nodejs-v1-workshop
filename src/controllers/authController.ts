import type { Request, Response } from 'express'
import { prisma } from '../db/connection.ts'
import type { LoginInput, RegisterInput } from '../db/validation.ts'
import { Prisma } from '../generated/prisma/client.ts'
import { APIError } from '../middleware/errorHandler.ts'
import { generateToken } from '../utils/jwt.ts'
import { comparePassword, hashPassword } from '../utils/password.ts'

export const register = async (
  req: Request<{}, unknown, RegisterInput>,
  res: Response,
) => {
  const hashedPassword = await hashPassword(req.body.password)

  try {
    const user = await prisma.user.create({
      data: {
        ...req.body,
        password: hashedPassword,
      },
      omit: {
        password: true,
      },
    })

    const token = await generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
    })

    res.status(201).json({ message: 'User created', user, token })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new APIError(409, 'Email or username already in use')
    }

    throw error
  }
}

export const login = async (
  req: Request<{}, unknown, LoginInput>,
  res: Response,
) => {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    throw new APIError(401, 'Invalid credentials')
  }

  const isValidPassword = await comparePassword(password, user.password)

  if (!isValidPassword) {
    throw new APIError(401, 'Invalid credentials')
  }

  const token = await generateToken({
    id: user.id,
    email: user.email,
    username: user.username,
  })

  const { password: _password, ...userWithoutPassword } = user

  res.json({ message: 'Login success', user: userWithoutPassword, token })
}
