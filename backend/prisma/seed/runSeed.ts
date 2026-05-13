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
import { seedPermissions } from './seeders/permissions'
import { seedUserAccounts } from './seeders/userAccounts'

// New seeders
import { seedBranches } from './seeders/branches'
import { seedEducationTypes } from './seeders/educationTypes'
import { seedEducations } from './seeders/educations'
import { seedSkills } from './seeders/skills'
import { seedCvSources } from './seeders/cvSources'
import { seedSubPositions } from './seeders/subPositions'
import { seedPositionSettings } from './seeders/positionSettings'
import { seedCapabilities } from './seeders/capabilities'
import { seedCapabilitySettings } from './seeders/capabilitySettings'
import { seedScoreSettings } from './seeders/scoreSettings'
import { seedJobRequisitions } from './seeders/jobRequisitions'
import { seedCandidates } from './seeders/candidates'
import { seedInterviews } from './seeders/interviews'
import { seedInterviewSchedules } from './seeders/interviewSchedules'
import { seedProjectTasks } from './seeders/projectTasks'
import { seedProjectMemberShadows } from './seeders/projectMemberShadows'
import { seedTimesheetEntries } from './seeders/timesheetEntries'
import { seedReviewInterns } from './seeders/reviewInterns'
import { seedTeamBuildingRequests } from './seeders/teamBuildingRequests'
import { seedWorkingTimeRequests } from './seeders/workingTimeRequests'
import { seedOnsiteRequests } from './seeders/onsiteRequests'
import { seedLeaveTypes } from './seeders/leaveTypes'
import { seedOffDays } from './seeders/offDays'
import { seedSystemSettings } from './seeders/systemSettings'

export const runSeed = async (): Promise<void> => {
  const ctx = createSeedContext()

  try {
    await clearAllData(ctx)

    // Base
    await seedDepartments(ctx)
    await seedPositions(ctx)
    await seedJobTitles(ctx)

    // Master data
    await seedBranches(ctx)
    await seedEducationTypes(ctx)
    await seedSkills(ctx)
    await seedCvSources(ctx)

    // Depends on master data
    await seedEducations(ctx)
    await seedSubPositions(ctx)
    await seedPositionSettings(ctx)

    // Capability & assessment
    await seedCapabilities(ctx)
    await seedCapabilitySettings(ctx)
    await seedScoreSettings(ctx)

    // Core employees & users
    await seedEmployees(ctx)
    await seedUserAccounts(ctx)

    // Recruitment
    await seedJobRequisitions(ctx)
    await seedCandidates(ctx)
    await seedInterviews(ctx)
    await seedInterviewSchedules(ctx)

    // Projects
    await seedProjects(ctx)
    await seedProjectTasks(ctx)
    await seedProjectMembers(ctx)
    await seedProjectMemberShadows(ctx)

    // Timesheet & requests
    await seedTimesheetEntries(ctx)
    await seedReviewInterns(ctx)
    await seedTeamBuildingRequests(ctx)
    await seedWorkingTimeRequests(ctx)
    await seedOnsiteRequests(ctx)

    // System config
    await seedLeaveTypes(ctx)
    await seedOffDays(ctx)
    await seedSystemSettings(ctx)

    // Existing feature seeders
    await seedCustomers(ctx)
    await seedProjectCustomers(ctx)
    await seedEmployeeTitleHistories(ctx)
    await seedScheduleRequests(ctx)
    await seedDailyReports(ctx)
    await seedProjectRevenues(ctx)
    await seedProjectDocuments(ctx)
    await seedAuditLogs(ctx)
    await seedPermissions(ctx)
  } finally {
    await ctx.prisma.$disconnect()
  }
}
