import { PrismaClient } from '@prisma/client'

import { ids, type SeedIds } from './ids'
import { makeId } from './utils'

export type SeedState = {
  employeeIds: string[]
  projectIds: string[]
  customerIds: string[]
  branchIds: string[]
  educationTypeIds: string[]
  educationIds: string[]
  skillIds: string[]
  cvSourceIds: string[]
  subPositionIds: string[]
  capabilityIds: string[]
  capabilitySettingIds: string[]
  scoreSettingIds: string[]
  jobRequisitionIds: string[]
  candidateIds: string[]
  interviewIds: string[]
  interviewScheduleIds: string[]
  projectTaskIds: string[]
  timesheetEntryIds: string[]
  reviewInternIds: string[]
  teamBuildingRequestIds: string[]
  workingTimeRequestIds: string[]
  onsiteRequestIds: string[]
  leaveTypeIds: string[]
  offDayIds: string[]
  systemSettingIds: string[]
  projectMemberShadowIds: string[]
}

export type SeedContext = {
  prisma: PrismaClient
  ids: SeedIds
  makeId: (prefix: string, index: number) => string
  state: SeedState
}

export const createSeedContext = (): SeedContext => {
  const prisma = new PrismaClient()

  return {
    prisma,
    ids,
    makeId,
    state: {
      employeeIds: [...Object.values(ids.employees)],
      projectIds: [...Object.values(ids.projects)],
      customerIds: [...Object.values(ids.customers)],
      branchIds: [...Object.values(ids.branches)],
      educationTypeIds: [...Object.values(ids.educationTypes)],
      educationIds: [...Object.values(ids.educations)],
      skillIds: [...Object.values(ids.skills)],
      cvSourceIds: [...Object.values(ids.cvSources)],
      subPositionIds: [...Object.values(ids.subPositions)],
      capabilityIds: [...Object.values(ids.capabilities)],
      capabilitySettingIds: [...Object.values(ids.capabilitySettings)],
      scoreSettingIds: [...Object.values(ids.scoreSettings)],
      jobRequisitionIds: [...Object.values(ids.jobRequisitions)],
      candidateIds: [...Object.values(ids.candidates)],
      interviewIds: [...Object.values(ids.interviews)],
      interviewScheduleIds: [...Object.values(ids.interviewSchedules)],
      projectTaskIds: [...Object.values(ids.projectTasks)],
      timesheetEntryIds: [...Object.values(ids.timesheetEntries)],
      reviewInternIds: [...Object.values(ids.reviewInterns)],
      teamBuildingRequestIds: [...Object.values(ids.teamBuildingRequests)],
      workingTimeRequestIds: [...Object.values(ids.workingTimeRequests)],
      onsiteRequestIds: [...Object.values(ids.onsiteRequests)],
      leaveTypeIds: [...Object.values(ids.leaveTypes)],
      offDayIds: [...Object.values(ids.offDays)],
      systemSettingIds: [...Object.values(ids.systemSettings)],
      projectMemberShadowIds: [],
    },
  }
}

