import { execSync } from 'node:child_process'
import { env, isTest } from '../../env.ts'

export default function setup() {
  if (!isTest() || !env.DATABASE_URL.endsWith('_test')) {
    throw new Error(
      'Tests must run with APP_STAGE=test and a database whose name ends with _test',
    )
  }

  execSync('npx prisma migrate deploy', { stdio: 'inherit' })
}
