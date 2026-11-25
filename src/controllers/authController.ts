import type { Request, Response } from 'express'
import { prisma } from '../db/connection.ts'
import type { LoginInput, RegisterInput } from '../db/validation.ts'
import { Prisma } from '../generated/prisma/client.ts'
import { generateToken } from '../utils/jwt.ts'
import { comparePassword, hashPassword } from '../utils/password.ts'

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

export const login = async (
  req: Request<{}, unknown, LoginInput>,
  res: Response,
) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isValidPassword = await comparePassword(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = await generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
    })

    const { password: _password, ...userWithoutPassword } = user

    res.json({ message: 'Login success', user: userWithoutPassword, token })
  } catch (error) {
    console.error('Login error', error)
    res.status(500).json({ error: 'Failed to login' })
  }
}
