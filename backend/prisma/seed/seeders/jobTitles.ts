import type { SeedContext } from '../context'

export const seedJobTitles = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids } = ctx

  const items = [
    { id: ids.jobTitles.junior, name: 'Junior', levelOrder: 1, description: 'Entry level', active: true },
    { id: ids.jobTitles.middle, name: 'Middle', levelOrder: 2, description: 'Mid level', active: true },
    { id: ids.jobTitles.senior, name: 'Senior', levelOrder: 3, description: 'Senior level', active: true },
    { id: ids.jobTitles.lead, name: 'Lead', levelOrder: 4, description: 'Team lead', active: true },
    { id: ids.jobTitles.manager, name: 'Manager', levelOrder: 5, description: 'Department manager', active: true },
  ]

  for (const item of items) {
    await prisma.jobTitle.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}

