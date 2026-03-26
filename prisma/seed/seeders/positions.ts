import type { SeedContext } from '../context'

export const seedPositions = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids } = ctx

  const items = [
    { id: ids.positions.backend, name: 'Backend Developer', description: 'API and integration', active: true },
    { id: ids.positions.frontend, name: 'Frontend Developer', description: 'Web UI development', active: true },
    { id: ids.positions.qa, name: 'QA Engineer', description: 'Quality assurance and testing', active: true },
    { id: ids.positions.pm, name: 'Project Manager', description: 'Project planning and delivery', active: true },
    { id: ids.positions.sales, name: 'Sales Executive', description: 'Customer acquisition', active: true },
    { id: ids.positions.hrbp, name: 'HR Business Partner', description: 'People operations', active: true },
  ]

  for (const item of items) {
    await prisma.position.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}

