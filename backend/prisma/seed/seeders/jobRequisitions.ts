import { JobRequisitionStatus, RequisitionType } from '@prisma/client'

import type { SeedContext } from '../context'

export const seedJobRequisitions = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids } = ctx

  const items = [
    {
      id: ids.jobRequisitions.reqBE,
      title: 'Tuyển Backend Developer',
      description: 'Tuyển dụng lập trình viên backend cho dự án EMS',
      department: 'engineering',
      location: 'Hà Nội',
      salaryMin: 15000000,
      salaryMax: 30000000,
      status: JobRequisitionStatus.OPEN,
      type: RequisitionType.STAFF,
      requestedBy: ids.employees.nguyenAn,
      openedAt: new Date('2026-01-15'),
      positionId: ids.positions.backend,
      subPositionId: ids.subPositions.juniorBE,
    },
    {
      id: ids.jobRequisitions.reqFE,
      title: 'Tuyển Frontend Developer',
      description: 'Tuyển dụng lập trình viên frontend cho dự án EMS',
      department: 'engineering',
      location: 'Hồ Chí Minh',
      salaryMin: 14000000,
      salaryMax: 28000000,
      status: JobRequisitionStatus.OPEN,
      type: RequisitionType.STAFF,
      requestedBy: ids.employees.tranBinh,
      openedAt: new Date('2026-02-01'),
      positionId: ids.positions.frontend,
      subPositionId: ids.subPositions.juniorFE,
    },
    {
      id: ids.jobRequisitions.reqQA,
      title: 'Tuyển QA Engineer',
      description: 'Tuyển dụng kỹ sư kiểm thử phần mềm',
      department: 'engineering',
      location: 'Đà Nẵng',
      salaryMin: 12000000,
      salaryMax: 25000000,
      status: JobRequisitionStatus.CLOSED,
      type: RequisitionType.STAFF,
      requestedBy: ids.employees.hoangEm,
      openedAt: new Date('2025-10-01'),
      closedAt: new Date('2025-12-31'),
      positionId: ids.positions.qa,
      subPositionId: ids.subPositions.qaAuto,
    },
    {
      id: ids.jobRequisitions.reqIntern,
      title: 'Tuyển Intern Developer',
      description: 'Tuyển dụng thực tập sinh lập trình',
      department: 'engineering',
      location: 'Hà Nội',
      salaryMin: 3000000,
      salaryMax: 5000000,
      status: JobRequisitionStatus.OPEN,
      type: RequisitionType.INTERN,
      requestedBy: ids.employees.nguyenAn,
      openedAt: new Date('2026-03-01'),
      positionId: ids.positions.backend,
      subPositionId: ids.subPositions.juniorBE,
    },
  ]

  for (const item of items) {
    await prisma.jobRequisition.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}
