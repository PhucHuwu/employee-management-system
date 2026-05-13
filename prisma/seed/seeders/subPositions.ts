import type { SeedContext } from '../context'

export const seedSubPositions = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids } = ctx

  const items = [
    {
      id: ids.subPositions.juniorBE,
      name: 'Junior Backend',
      color: '#3b82f6',
      positionId: ids.positions.backend,
    },
    {
      id: ids.subPositions.seniorBE,
      name: 'Senior Backend',
      color: '#1e40af',
      positionId: ids.positions.backend,
    },
    {
      id: ids.subPositions.juniorFE,
      name: 'Junior Frontend',
      color: '#f59e0b',
      positionId: ids.positions.frontend,
    },
    {
      id: ids.subPositions.seniorFE,
      name: 'Senior Frontend',
      color: '#b45309',
      positionId: ids.positions.frontend,
    },
    {
      id: ids.subPositions.qaAuto,
      name: 'QA Automation',
      color: '#10b981',
      positionId: ids.positions.qa,
    },
    {
      id: ids.subPositions.qaManual,
      name: 'QA Manual',
      color: '#059669',
      positionId: ids.positions.qa,
    },
  ]

  for (const item of items) {
    await prisma.subPosition.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}
