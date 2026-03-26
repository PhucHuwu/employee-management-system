import { createSeedContext } from './context'
import { seedCustomers } from './seeders/customers'
import { clearAllData } from './seeders/clearAllData'
import { seedAuditLogs } from './seeders/auditLogs'
import { seedDailyReports } from './seeders/dailyReports'
import { seedDepartments } from './seeders/departments'
import { seedEmployeeTitleHistories } from './seeders/employeeTitleHistories'
import { seedEmployees } from './seeders/employees'
import { seedJobTitles } from './seeders/jobTitles'
import { seedPositions } from './seeders/positions'
import { seedProjectCustomers } from './seeders/projectCustomers'
import { seedProjectDocuments } from './seeders/projectDocuments'
import { seedProjectMembers } from './seeders/projectMembers'
import { seedProjectRevenues } from './seeders/projectRevenues'
import { seedProjects } from './seeders/projects'
import { seedScheduleRequests } from './seeders/scheduleRequests'
import { seedUserAccounts } from './seeders/userAccounts'

export const runSeed = async (): Promise<void> => {
  const ctx = createSeedContext()

  try {
    await clearAllData(ctx)

    await seedDepartments(ctx)
    await seedPositions(ctx)
    await seedJobTitles(ctx)
    await seedUserAccounts(ctx)
    await seedEmployees(ctx)
    await seedProjects(ctx)
    await seedProjectMembers(ctx)
    await seedCustomers(ctx)
    await seedProjectCustomers(ctx)
    await seedEmployeeTitleHistories(ctx)
    await seedScheduleRequests(ctx)
    await seedDailyReports(ctx)
    await seedProjectRevenues(ctx)
    await seedProjectDocuments(ctx)
    await seedAuditLogs(ctx)
  } finally {
    await ctx.prisma.$disconnect()
  }
}

