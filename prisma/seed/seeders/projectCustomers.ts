import type { SeedContext } from '../context'

export const seedProjectCustomers = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids, state } = ctx

  const baseItems = [
    { projectId: ids.projects.emsCore, customerId: ids.customers.alpha },
    { projectId: ids.projects.mobileApp, customerId: ids.customers.beta },
    { projectId: ids.projects.dataHub, customerId: ids.customers.gamma },
  ]

  for (const item of baseItems) {
    await prisma.projectCustomer.upsert({
      where: {
        projectId_customerId: {
          projectId: item.projectId,
          customerId: item.customerId,
        },
      },
      update: item,
      create: item,
    })
  }

  for (const [index, projectId] of state.projectIds.entries()) {
    const customerId = state.customerIds[index % state.customerIds.length]
    await prisma.projectCustomer.upsert({
      where: {
        projectId_customerId: { projectId, customerId },
      },
      update: { projectId, customerId },
      create: { projectId, customerId },
    })
  }
}

