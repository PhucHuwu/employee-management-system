import type { SeedContext } from '../context'

export const seedScoreSettings = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids } = ctx

  const items = [
    { id: ids.scoreSettings.internBE1, userType: 'intern', positionId: ids.positions.backend, scoreFrom: 0, scoreTo: 50, level: 'Cần cải thiện' },
    { id: ids.scoreSettings.internBE2, userType: 'intern', positionId: ids.positions.backend, scoreFrom: 50, scoreTo: 75, level: 'Đạt yêu cầu' },
    { id: ids.scoreSettings.internBE3, userType: 'intern', positionId: ids.positions.backend, scoreFrom: 75, scoreTo: 100, level: 'Xuất sắc' },
    { id: ids.scoreSettings.internFE1, userType: 'intern', positionId: ids.positions.frontend, scoreFrom: 0, scoreTo: 50, level: 'Cần cải thiện' },
    { id: ids.scoreSettings.internFE2, userType: 'intern', positionId: ids.positions.frontend, scoreFrom: 50, scoreTo: 75, level: 'Đạt yêu cầu' },
    { id: ids.scoreSettings.internFE3, userType: 'intern', positionId: ids.positions.frontend, scoreFrom: 75, scoreTo: 100, level: 'Xuất sắc' },
  ]

  for (const item of items) {
    await prisma.scoreSetting.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}
