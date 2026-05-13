import type { SeedContext } from '../context'

export const seedPositionSettings = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids } = ctx

  const items = [
    {
      id: ids.positionSettings.juniorBE,
      userType: 'intern',
      lmsConfig: '{ "testType": "backend_basics", "duration": 60 }',
      subPositionId: ids.subPositions.juniorBE,
    },
    {
      id: ids.positionSettings.seniorBE,
      userType: 'staff',
      lmsConfig: '{ "testType": "backend_advanced", "duration": 90 }',
      subPositionId: ids.subPositions.seniorBE,
    },
  ]

  for (const item of items) {
    await prisma.positionSetting.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}
