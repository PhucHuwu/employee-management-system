import type { SeedContext } from '../context'

export const seedDepartments = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids } = ctx

  const items = [
    { id: ids.departments.engineering, name: 'Engineering' },
    { id: ids.departments.business, name: 'Business Development' },
    { id: ids.departments.hr, name: 'Human Resources' },
    { id: ids.departments.finance, name: 'Finance' },
  ]

  for (const item of items) {
    await prisma.department.upsert({
      where: { id: item.id },
      update: { name: item.name },
      create: item,
    })
  }
}

