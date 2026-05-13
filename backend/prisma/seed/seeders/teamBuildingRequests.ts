import { TeamBuildingStatus } from '@prisma/client'

import type { SeedContext } from '../context'

export const seedTeamBuildingRequests = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids, makeId } = ctx

  const items = [
    {
      id: ids.teamBuildingRequests.tb1,
      note: 'Team building cuối tháng 4 - Đi chơi núi Bà Đen',
      totalMoney: 5000000,
      status: TeamBuildingStatus.APPROVED,
      pmId: ids.employees.nguyenAn,
      projectId: ids.projects.emsCore,
      participantIds: [
        ids.employees.nguyenAn,
        ids.employees.tranBinh,
        ids.employees.hoangEm,
        ids.employees.ngoPhuong,
      ],
    },
    {
      id: ids.teamBuildingRequests.tb2,
      note: 'Team building dự án Mobile App - Bowling',
      totalMoney: 3000000,
      status: TeamBuildingStatus.PENDING,
      pmId: ids.employees.leCuong,
      projectId: ids.projects.mobileApp,
      participantIds: [
        ids.employees.leCuong,
        ids.employees.phamDung,
      ],
    },
  ]

  let participantIndex = 1
  for (const item of items) {
    const { participantIds, ...requestData } = item

    await prisma.teamBuildingRequest.upsert({
      where: { id: item.id },
      update: requestData,
      create: requestData,
    })

    for (const employeeId of participantIds) {
      await prisma.teamBuildingParticipant.upsert({
        where: {
          requestId_employeeId: {
            requestId: item.id,
            employeeId,
          },
        },
        update: {},
        create: {
          id: makeId('97500000', participantIndex++),
          requestId: item.id,
          employeeId,
        },
      })
    }
  }
}
