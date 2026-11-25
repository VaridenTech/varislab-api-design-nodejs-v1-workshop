import { afterAll, describe, expect, it } from 'vitest'
import { env, isTest } from '../env.ts'
import { cleanupDatabase, createTestUser } from './helpers/dbHelpers.ts'

describe('test setup', () => {
  afterAll(async () => {
    await cleanupDatabase()
  })

  it('runs in the test stage against the test database', () => {
    expect(isTest()).toBe(true)
    expect(env.DATABASE_URL).toMatch(/_test$/)
  })

  it('can write to the test database', async () => {
    const { user, token } = await createTestUser()

    expect(user.id).toBeDefined()
    expect(user.email).toContain('@example.com')
    expect(token.split('.')).toHaveLength(3)
  })
})
