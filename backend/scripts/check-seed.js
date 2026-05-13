const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const counts = {
    department: await prisma.department.count(),
    position: await prisma.position.count(),
    jobTitle: await prisma.jobTitle.count(),
    employee: await prisma.employee.count(),
    project: await prisma.project.count(),
    projectMember: await prisma.projectMember.count(),
    customer: await prisma.customer.count(),
    projectCustomer: await prisma.projectCustomer.count(),
    scheduleRequest: await prisma.scheduleRequest.count(),
    dailyReport: await prisma.dailyReport.count(),
    projectRevenue: await prisma.projectRevenue.count(),
    projectDocument: await prisma.projectDocument.count(),
    auditLog: await prisma.auditLog.count(),
    userAccount: await prisma.userAccount.count(),
    employeeTitleHistory: await prisma.employeeTitleHistory.count(),
  }

  const users = await prisma.userAccount.findMany({
    select: {
      email: true,
      role: true,
      active: true,
      departmentScopeId: true,
      projectScopeIds: true,
    },
    orderBy: { email: 'asc' },
  })

  console.log(JSON.stringify({ counts, users }, null, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
