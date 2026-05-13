const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function count() {
  const counts = {
    departments: await prisma.department.count(),
    employees: await prisma.employee.count(),
    userAccounts: await prisma.userAccount.count(),
    projects: await prisma.project.count(),
    customers: await prisma.customer.count(),
    jobTitles: await prisma.jobTitle.count(),
    positions: await prisma.position.count(),
    auditLogs: await prisma.auditLog.count(),
    permissions: await prisma.permission.count(),
    dailyReports: await prisma.dailyReport.count(),
    scheduleRequests: await prisma.scheduleRequest.count(),
    projectRevenues: await prisma.projectRevenue.count(),
    projectDocuments: await prisma.projectDocument.count(),
    branches: await prisma.branch.count(),
    educations: await prisma.education.count(),
    skills: await prisma.skill.count(),
    cvSources: await prisma.cVSource.count(),
    subPositions: await prisma.subPosition.count(),
    capabilities: await prisma.capability.count(),
    scoreSettings: await prisma.scoreSetting.count(),
    jobRequisitions: await prisma.jobRequisition.count(),
    candidates: await prisma.candidate.count(),
    interviews: await prisma.interview.count(),
    interviewSchedules: await prisma.interviewSchedule.count(),
    projectTasks: await prisma.projectTask.count(),
    projectMembers: await prisma.projectMember.count(),
    projectMemberShadows: await prisma.projectMemberShadow.count(),
    timesheetEntries: await prisma.timesheetEntry.count(),
    reviewInterns: await prisma.reviewIntern.count(),
    teamBuildingRequests: await prisma.teamBuildingRequest.count(),
    workingTimeRequests: await prisma.workingTimeRequest.count(),
    onsiteRequests: await prisma.onsiteRequest.count(),
    leaveTypes: await prisma.leaveType.count(),
    offDays: await prisma.offDay.count(),
    systemSettings: await prisma.systemSetting.count(),
  };

  console.log('=== Seed Verification ===');
  for (const [key, value] of Object.entries(counts)) {
    console.log(`${key}: ${value}`);
  }
  await prisma.$disconnect();
}

count().catch((e) => {
  console.error(e);
  process.exit(1);
});
