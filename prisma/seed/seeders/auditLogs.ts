import { Role } from '@prisma/client'

import type { SeedContext } from '../context'

export const seedAuditLogs = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids, makeId, state } = ctx

  const baseItems = [
    {
      id: '94000000-0000-0000-0000-000000000001',
      actorId: ids.users.admin,
      actorRole: Role.ADMIN,
      action: 'EMPLOYEE_CREATED',
      entityType: 'EMPLOYEE',
      entityId: ids.employees.nguyenAn,
      newData: { fullName: 'Nguyễn Văn An' },
    },
    {
      id: '94000000-0000-0000-0000-000000000002',
      actorId: ids.users.managerEngineering,
      actorRole: Role.MANAGER,
      action: 'SCHEDULE_REQUEST_APPROVED',
      entityType: 'SCHEDULE_REQUEST',
      entityId: '90000000-0000-0000-0000-000000000002',
      oldData: { status: 'PENDING' },
      newData: { status: 'APPROVED' },
    },
    {
      id: '94000000-0000-0000-0000-000000000003',
      actorId: ids.users.managerBusiness,
      actorRole: Role.MANAGER,
      action: 'PROJECT_REVENUE_CREATED',
      entityType: 'PROJECT_REVENUE',
      entityId: '92000000-0000-0000-0000-000000000001',
      newData: { amount: 500000000, currency: 'VND' },
    },
  ]

  for (const item of baseItems) {
    await prisma.auditLog.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }

  const bulkCount = 90
  for (let i = 0; i < bulkCount; i += 1) {
    const actorId = i % 3 === 0 ? ids.users.admin : i % 2 === 0 ? ids.users.managerEngineering : ids.users.managerBusiness
    const actorRole = i % 3 === 0 ? Role.ADMIN : Role.MANAGER
    const action = i % 4 === 0 ? 'PROJECT_UPDATED' : i % 4 === 1 ? 'EMPLOYEE_UPDATED' : i % 4 === 2 ? 'SCHEDULE_REQUEST_APPROVED' : 'DAILY_REPORT_CREATED'
    const entityType = i % 4 === 0 ? 'PROJECT' : i % 4 === 1 ? 'EMPLOYEE' : i % 4 === 2 ? 'SCHEDULE_REQUEST' : 'DAILY_REPORT'
    const entityId =
      entityType === 'PROJECT'
        ? state.projectIds[i % state.projectIds.length]
        : entityType === 'EMPLOYEE'
          ? state.employeeIds[i % state.employeeIds.length]
          : entityType === 'SCHEDULE_REQUEST'
            ? makeId('95000000', (i % 240) + 1)
            : makeId('96000000', (i % 720) + 1)

    await prisma.auditLog.upsert({
      where: { id: makeId('99000000', i + 1) },
      update: {
        actorId,
        actorRole,
        action,
        entityType,
        entityId,
        oldData: { seed: true, version: 1 },
        newData: { seed: true, version: 2, index: i + 1 },
      },
      create: {
        id: makeId('99000000', i + 1),
        actorId,
        actorRole,
        action,
        entityType,
        entityId,
        oldData: { seed: true, version: 1 },
        newData: { seed: true, version: 2, index: i + 1 },
      },
    })
  }
}

