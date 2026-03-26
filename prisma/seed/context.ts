import { PrismaClient } from '@prisma/client'

import { ids, type SeedIds } from './ids'
import { makeId } from './utils'

export type SeedState = {
  employeeIds: string[]
  projectIds: string[]
  customerIds: string[]
}

export type SeedContext = {
  prisma: PrismaClient
  ids: SeedIds
  makeId: (prefix: string, index: number) => string
  state: SeedState
}

export const createSeedContext = (): SeedContext => {
  const prisma = new PrismaClient()

  return {
    prisma,
    ids,
    makeId,
    state: {
      employeeIds: [...Object.values(ids.employees)],
      projectIds: [...Object.values(ids.projects)],
      customerIds: [...Object.values(ids.customers)],
    },
  }
}

