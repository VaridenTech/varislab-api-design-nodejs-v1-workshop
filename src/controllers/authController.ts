import type { Request, Response } from 'express'
import { prisma } from '../db/connection.ts'
import type { RegisterInput } from '../db/validation.ts'
import { Prisma } from '../generated/prisma/client.ts'
import { generateToken } from '../utils/jwt.ts'
import { hashPassword } from '../utils/password.ts'

export const register = async (
  req: Request<{}, unknown, RegisterInput>,
  res: Response,
) => {
  try {
    const hashedPassword = await hashPassword(req.body.password)

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
      return res.status(409).json({ error: 'Email or username already in use' })
    }

    console.error('Registration error', error)
    res.status(500).json({ error: 'Failed to create user' })
  }
}
