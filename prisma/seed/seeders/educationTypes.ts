import type { SeedContext } from '../context'

export const seedEducationTypes = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids } = ctx

  const items = [
    { id: ids.educationTypes.university, name: 'Đại học' },
    { id: ids.educationTypes.college, name: 'Cao đẳng' },
    { id: ids.educationTypes.bootcamp, name: 'Bootcamp' },
    { id: ids.educationTypes.online, name: 'Online Course' },
  ]

  for (const item of items) {
    await prisma.educationType.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}
