import { OnsiteRequestPeriod, OnsiteRequestStatus } from '@prisma/client'

import type { SeedContext } from '../context'

export const seedOnsiteRequests = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids } = ctx

  const items = [
    {
      id: ids.onsiteRequests.onsite1,
      requestDate: new Date('2026-05-10'),
      period: OnsiteRequestPeriod.FULL_DAY,
      hours: null,
      reason: 'Triển khai hệ thống tại chi nhánh khách hàng',
      status: OnsiteRequestStatus.APPROVED,
      employeeId: ids.employees.nguyenAn,
    },
    {
      id: ids.onsiteRequests.onsite2,
      requestDate: new Date('2026-05-12'),
      period: OnsiteRequestPeriod.AM,
      hours: null,
      reason: 'Họp review với khách hàng Alpha',
      status: OnsiteRequestStatus.PENDING,
      employeeId: ids.employees.tranBinh,
    },
    {
      id: ids.onsiteRequests.onsite3,
      requestDate: new Date('2026-05-15'),
      period: OnsiteRequestPeriod.HOURS,
      hours: 4,
      reason: 'Hỗ trợ kỹ thuật onsite',
      status: OnsiteRequestStatus.REJECTED,
      employeeId: ids.employees.leCuong,
    },
  ]

  for (const item of items) {
    await prisma.onsiteRequest.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}
