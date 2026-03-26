import { runSeed } from './seed/runSeed'

runSeed().catch((error: unknown) => {
  throw error
})
