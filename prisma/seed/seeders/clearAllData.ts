import type { SeedContext } from '../context'

export const clearAllData = async (ctx: SeedContext): Promise<void> => {
  const { prisma } = ctx

  await prisma.auditLog.deleteMany()
  await prisma.projectDocument.deleteMany()
  await prisma.projectRevenue.deleteMany()
  await prisma.dailyReport.deleteMany()
  await prisma.scheduleRequest.deleteMany()
  await prisma.employeeTitleHistory.deleteMany()
  await prisma.projectCustomer.deleteMany()
  await prisma.projectMember.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.project.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.userAccount.deleteMany()
  await prisma.jobTitle.deleteMany()
  await prisma.position.deleteMany()
  await prisma.department.deleteMany()
}

