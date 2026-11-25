import request from 'supertest'
import { afterEach, describe, expect, it } from 'vitest'
import app from '../src/server.ts'
import {
  cleanupDatabase,
  createTestHabit,
  createTestUser,
} from './helpers/dbHelpers.ts'

describe('Habit endpoints', () => {
  afterEach(async () => {
    await cleanupDatabase()
  })

  it('rejects requests without a token', async () => {
    const response = await request(app).get('/api/habits')

    expect(response.status).toBe(401)
  })

  it('creates a habit for the signed-in user', async () => {
    const { user, token } = await createTestUser()

    const response = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Exercise daily', frequency: 'daily' })

    expect(response.status).toBe(201)
    expect(response.body.habit.name).toBe('Exercise daily')
    expect(response.body.habit.userId).toBe(user.id)
    expect(response.body.habit.targetCount).toBe(1)
  })

  it('lists only the habits of the signed-in user', async () => {
    const owner = await createTestUser()
    const stranger = await createTestUser()
    await createTestHabit(owner.user.id, 'Owner habit')
    await createTestHabit(stranger.user.id, 'Stranger habit')

    const response = await request(app)
      .get('/api/habits')
      .set('Authorization', `Bearer ${owner.token}`)

    expect(response.status).toBe(200)
    expect(response.body.habits).toHaveLength(1)
    expect(response.body.habits[0].name).toBe('Owner habit')
  })

  it('returns 404 when reading a habit owned by someone else', async () => {
    const owner = await createTestUser()
    const stranger = await createTestUser()
    const habit = await createTestHabit(owner.user.id)

    const response = await request(app)
      .get(`/api/habits/${habit.id}`)
      .set('Authorization', `Bearer ${stranger.token}`)

    expect(response.status).toBe(404)
  })
})
