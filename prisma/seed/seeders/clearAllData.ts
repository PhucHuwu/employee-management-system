import type { SeedContext } from '../context'

export const clearAllData = async (ctx: SeedContext): Promise<void> => {
  const { prisma } = ctx

  // Delete in reverse dependency order
  await prisma.auditLog.deleteMany()
  await prisma.projectDocument.deleteMany()
  await prisma.projectRevenue.deleteMany()
  await prisma.dailyReport.deleteMany()
  await prisma.scheduleRequest.deleteMany()
  await prisma.employeeTitleHistory.deleteMany()
  await prisma.projectCustomer.deleteMany()

  // New: project expansion
  await prisma.projectMemberShadow.deleteMany()
  await prisma.timesheetEntry.deleteMany()
  await prisma.projectTask.deleteMany()

  await prisma.projectMember.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.project.deleteMany()

  // New: recruitment
  await prisma.interviewSchedule.deleteMany()
  await prisma.interview.deleteMany()
  await prisma.candidateSkill.deleteMany()
  await prisma.candidate.deleteMany()
  await prisma.jobRequisition.deleteMany()

  // New: review intern
  await prisma.reviewInternDetail.deleteMany()
  await prisma.reviewIntern.deleteMany()

  // New: team building
  await prisma.teamBuildingParticipant.deleteMany()
  await prisma.teamBuildingRequest.deleteMany()

  // New: requests
  await prisma.workingTimeRequest.deleteMany()
  await prisma.onsiteRequest.deleteMany()

  // New: employee skills
  await prisma.employeeSkill.deleteMany()

  await prisma.employee.deleteMany()
  await prisma.permission.deleteMany()
  await prisma.userAccount.deleteMany()

  // New: capability & assessment
  await prisma.capabilitySettingItem.deleteMany()
  await prisma.capabilitySetting.deleteMany()
  await prisma.scoreSetting.deleteMany()
  await prisma.capability.deleteMany()
  await prisma.positionSetting.deleteMany()
  await prisma.subPosition.deleteMany()

  // New: master data
  await prisma.education.deleteMany()
  await prisma.educationType.deleteMany()
  await prisma.skill.deleteMany()
  await prisma.cVSource.deleteMany()
  await prisma.branch.deleteMany()

  // New: system config
  await prisma.systemSetting.deleteMany()
  await prisma.leaveType.deleteMany()
  await prisma.offDay.deleteMany()

  await prisma.jobTitle.deleteMany()
  await prisma.position.deleteMany()
  await prisma.department.deleteMany()
}

