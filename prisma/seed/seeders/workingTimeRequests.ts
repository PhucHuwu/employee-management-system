import { WorkingTimeTemplate, WorkingTimeStatus } from '@prisma/client'

import type { SeedContext } from '../context'

export const seedWorkingTimeRequests = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids } = ctx

  const items = [
    {
      id: ids.workingTimeRequests.wt1,
      template: WorkingTimeTemplate.SHIFT_9_6,
      status: WorkingTimeStatus.APPROVED,
      employeeId: ids.employees.nguyenAn,
    },
    {
      id: ids.workingTimeRequests.wt2,
      template: WorkingTimeTemplate.SHIFT_8_5,
      status: WorkingTimeStatus.PENDING,
      employeeId: ids.employees.tranBinh,
    },
  ]

  for (const item of items) {
    await prisma.workingTimeRequest.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}
