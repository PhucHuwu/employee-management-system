import { RevenueType } from '@prisma/client'

import type { SeedContext } from '../context'

export const seedProjectRevenues = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids, makeId, state } = ctx

  const baseItems = [
    {
      id: '92000000-0000-0000-0000-000000000001',
      projectId: ids.projects.emsCore,
      periodMonth: 3,
      periodYear: 2026,
      revenueType: RevenueType.FORECAST,
      amount: 500000000,
      currency: 'VND',
      note: 'March forecast',
    },
    {
      id: '92000000-0000-0000-0000-000000000002',
      projectId: ids.projects.emsCore,
      periodMonth: 3,
      periodYear: 2026,
      revenueType: RevenueType.ACTUAL,
      amount: 480000000,
      currency: 'VND',
      note: 'March actual',
    },
    {
      id: '92000000-0000-0000-0000-000000000003',
      projectId: ids.projects.mobileApp,
      periodMonth: 4,
      periodYear: 2026,
      revenueType: RevenueType.FORECAST,
      amount: 300000000,
      currency: 'VND',
      note: 'Paused project baseline',
    },
  ]

  for (const item of baseItems) {
    await prisma.projectRevenue.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }

  let revenueIndex = 1
  for (const projectId of state.projectIds) {
    for (let month = 1; month <= 12; month += 1) {
      for (const revenueType of [RevenueType.FORECAST, RevenueType.ACTUAL]) {
        const id = makeId('97000000', revenueIndex)
        const amount = 150000000 + month * 12000000 + (revenueType === RevenueType.ACTUAL ? 7000000 : 0)

        await prisma.projectRevenue.upsert({
          where: { id },
          update: {
            projectId,
            periodMonth: month,
            periodYear: 2026,
            revenueType,
            amount,
            currency: 'VND',
            note: `Seed ${revenueType.toLowerCase()} M${month}/2026`,
          },
          create: {
            id,
            projectId,
            periodMonth: month,
            periodYear: 2026,
            revenueType,
            amount,
            currency: 'VND',
            note: `Seed ${revenueType.toLowerCase()} M${month}/2026`,
          },
        })

        revenueIndex += 1
      }
    }
  }
}

