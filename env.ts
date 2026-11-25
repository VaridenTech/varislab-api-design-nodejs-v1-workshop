import dotenv from 'dotenv'
import { z } from 'zod'

process.env.APP_STAGE = process.env.APP_STAGE || 'dev'

if (process.env.APP_STAGE === 'dev') {
  dotenv.config()
} else if (process.env.APP_STAGE === 'test') {
  dotenv.config({ path: '.env.test' })
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  APP_STAGE: z.enum(['dev', 'test', 'production']).default('dev'),
  PORT: z.coerce.number().int().positive().default(3000),
})

export type Env = z.infer<typeof envSchema>

const result = envSchema.safeParse(process.env)

if (!result.success) {
  console.error('Invalid environment variables')

  for (const issue of result.error.issues) {
    console.error(`- ${issue.path.join('.')}: ${issue.message}`)
  }

  process.exit(1)
}

export const env: Env = result.data

export const isProd = () => env.APP_STAGE === 'production'
export const isDev = () => env.APP_STAGE === 'dev'
export const isTest = () => env.APP_STAGE === 'test'

export default env
