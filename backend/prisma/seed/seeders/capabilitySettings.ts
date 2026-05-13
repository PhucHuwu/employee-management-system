import type { SeedContext } from '../context'

export const seedCapabilitySettings = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids, makeId } = ctx

  const settings = [
    {
      id: ids.capabilitySettings.internBE,
      userType: 'intern',
      positionId: ids.positions.backend,
      items: [
        { capabilityId: ids.capabilities.codeQuality, coefficient: 1.2, guideline: 'Clean code, unit test' },
        { capabilityId: ids.capabilities.teamwork, coefficient: 1.0, guideline: 'Active in daily standup' },
        { capabilityId: ids.capabilities.communication, coefficient: 1.0, guideline: 'Report blockers timely' },
        { capabilityId: ids.capabilities.problemSolving, coefficient: 1.2, guideline: 'Debug independently' },
        { capabilityId: ids.capabilities.learningAbility, coefficient: 1.5, guideline: 'Learn new tech quickly' },
        { capabilityId: ids.capabilities.responsibility, coefficient: 1.0, guideline: 'On time, accountable' },
      ],
    },
    {
      id: ids.capabilitySettings.internFE,
      userType: 'intern',
      positionId: ids.positions.frontend,
      items: [
        { capabilityId: ids.capabilities.codeQuality, coefficient: 1.2, guideline: 'Component reusability' },
        { capabilityId: ids.capabilities.teamwork, coefficient: 1.0, guideline: 'Pair with designer' },
        { capabilityId: ids.capabilities.communication, coefficient: 1.0, guideline: 'Clear UI/UX feedback' },
        { capabilityId: ids.capabilities.problemSolving, coefficient: 1.0, guideline: 'CSS/debug issues' },
        { capabilityId: ids.capabilities.learningAbility, coefficient: 1.5, guideline: 'Keep up with FE trends' },
        { capabilityId: ids.capabilities.responsibility, coefficient: 1.0, guideline: 'Pixel perfect delivery' },
      ],
    },
  ]

  let itemIndex = 1
  for (const setting of settings) {
    const { items, ...settingData } = setting

    await prisma.capabilitySetting.upsert({
      where: { id: setting.id },
      update: settingData,
      create: settingData,
    })

    for (const item of items) {
      await prisma.capabilitySettingItem.upsert({
        where: {
          capabilitySettingId_capabilityId: {
            capabilitySettingId: setting.id,
            capabilityId: item.capabilityId,
          },
        },
        update: {
          coefficient: item.coefficient,
          guideline: item.guideline,
        },
        create: {
          id: makeId('88500000', itemIndex++),
          coefficient: item.coefficient,
          guideline: item.guideline,
          capabilitySettingId: setting.id,
          capabilityId: item.capabilityId,
        },
      })
    }
  }
}
