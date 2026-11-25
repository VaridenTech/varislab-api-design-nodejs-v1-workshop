import request from 'supertest'
import { afterEach, describe, expect, it } from 'vitest'
import app from '../src/server.ts'
import { cleanupDatabase, createTestUser } from './helpers/dbHelpers.ts'

describe('Authentication endpoints', () => {
  afterEach(async () => {
    await cleanupDatabase()
  })

  describe('POST /api/auth/register', () => {
    it('registers a new user and returns a token', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'new-user@example.com',
        username: 'newuser',
        password: 'supersecret123',
      })

      expect(response.status).toBe(201)
      expect(response.body.user.email).toBe('new-user@example.com')
      expect(response.body.user).not.toHaveProperty('password')
      expect(response.body.token).toEqual(expect.any(String))
    })

    it('returns 400 when the password is missing', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'new-user@example.com',
        username: 'newuser',
      })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Validation failed')
      expect(response.body.details[0].field).toBe('password')
    })

    it('returns 409 when the email is already registered', async () => {
      const { user } = await createTestUser()

      const response = await request(app).post('/api/auth/register').send({
        email: user.email,
        username: 'another-name',
        password: 'supersecret123',
      })

      expect(response.status).toBe(409)
    })
  })

  describe('POST /api/auth/login', () => {
    it('logs in with valid credentials', async () => {
      const { user, password } = await createTestUser()

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password })

      expect(response.status).toBe(200)
      expect(response.body.token).toEqual(expect.any(String))
      expect(response.body.user).not.toHaveProperty('password')
    })

    it('returns 401 for a wrong password', async () => {
      const { user } = await createTestUser()

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: 'wrong-password' })

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Invalid credentials')
    })
  })
})
