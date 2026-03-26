import type { SeedContext } from '../context'

export const seedEmployeeTitleHistories = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids, makeId, state } = ctx

  const baseItems = [
    {
      id: '80000000-0000-0000-0000-000000000001',
      employeeId: ids.employees.nguyenAn,
      oldJobTitleId: null,
      newJobTitleId: ids.jobTitles.senior,
      effectiveDate: new Date('2024-01-01'),
      reason: 'Initial assignment',
      createdBy: ids.users.admin,
    },
    {
      id: '80000000-0000-0000-0000-000000000002',
      employeeId: ids.employees.nguyenAn,
      oldJobTitleId: ids.jobTitles.senior,
      newJobTitleId: ids.jobTitles.lead,
      effectiveDate: new Date('2025-06-01'),
      reason: 'Strong delivery ownership',
      createdBy: ids.users.admin,
    },
    {
      id: '80000000-0000-0000-0000-000000000003',
      employeeId: ids.employees.tranBinh,
      oldJobTitleId: null,
      newJobTitleId: ids.jobTitles.middle,
      effectiveDate: new Date('2024-03-01'),
      reason: 'Initial assignment',
      createdBy: ids.users.admin,
    },
    {
      id: '80000000-0000-0000-0000-000000000004',
      employeeId: ids.employees.leCuong,
      oldJobTitleId: null,
      newJobTitleId: ids.jobTitles.manager,
      effectiveDate: new Date('2023-01-01'),
      reason: 'Department head assignment',
      createdBy: ids.users.admin,
    },
  ]

  for (const item of baseItems) {
    await prisma.employeeTitleHistory.upsert({
      where: {
        employeeId_effectiveDate: {
          employeeId: item.employeeId,
          effectiveDate: item.effectiveDate,
        },
      },
      update: {
        oldJobTitleId: item.oldJobTitleId,
        newJobTitleId: item.newJobTitleId,
        reason: item.reason,
        createdBy: item.createdBy,
      },
      create: item,
    })
  }

  const baseEmployeeIdSet = new Set<string>(Object.values(ids.employees))
  const extraEmployeeIds = state.employeeIds.filter((employeeId) => !baseEmployeeIdSet.has(employeeId))

  for (const [index, employeeId] of extraEmployeeIds.entries()) {
    const titleId = [ids.jobTitles.junior, ids.jobTitles.middle, ids.jobTitles.senior][index % 3]
    const effectiveDate = new Date(2024, index % 10, (index % 20) + 1)

    await prisma.employeeTitleHistory.upsert({
      where: {
        employeeId_effectiveDate: { employeeId, effectiveDate },
      },
      update: {
        oldJobTitleId: null,
        newJobTitleId: titleId,
        reason: 'Initial assignment (extended seed)',
        createdBy: ids.users.admin,
      },
      create: {
        id: makeId('82000000', index + 1),
        employeeId,
        oldJobTitleId: null,
        newJobTitleId: titleId,
        effectiveDate,
        reason: 'Initial assignment (extended seed)',
        createdBy: ids.users.admin,
      },
    })
  }
}

