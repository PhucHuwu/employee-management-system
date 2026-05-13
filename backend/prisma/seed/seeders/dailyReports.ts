import type { SeedContext } from '../context'

export const seedDailyReports = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids, makeId, state } = ctx

  const baseItems = [
    {
      id: '91000000-0000-0000-0000-000000000001',
      employeeId: ids.employees.nguyenAn,
      projectId: ids.projects.emsCore,
      reportDate: new Date('2026-03-24'),
      task: 'Implement employee filters',
      workContent: 'Completed filter by position and department in list API and UI',
    },
    {
      id: '91000000-0000-0000-0000-000000000002',
      employeeId: ids.employees.nguyenAn,
      projectId: ids.projects.emsCore,
      reportDate: new Date('2026-03-25'),
      task: 'Review merge requests',
      workContent: 'Reviewed and merged 3 PRs for schedule and approval module',
    },
    {
      id: '91000000-0000-0000-0000-000000000003',
      employeeId: ids.employees.tranBinh,
      projectId: ids.projects.mobileApp,
      reportDate: new Date('2026-03-25'),
      task: 'Build dashboard cards',
      workContent: 'Implemented KPI cards and responsive layout',
    },
    {
      id: '91000000-0000-0000-0000-000000000004',
      employeeId: ids.employees.hoangEm,
      projectId: ids.projects.emsCore,
      reportDate: new Date('2026-03-25'),
      task: 'Test approval flow',
      workContent: 'Validated approve/reject flow and reported 2 defects',
    },
    {
      id: '91000000-0000-0000-0000-000000000005',
      employeeId: ids.employees.leCuong,
      projectId: ids.projects.dataHub,
      reportDate: new Date('2025-12-15'),
      task: 'Finalize business metrics',
      workContent: 'Completed KPI definitions for monthly report',
    },
  ]

  for (const item of baseItems) {
    await prisma.dailyReport.upsert({
      where: {
        employeeId_reportDate_projectId: {
          employeeId: item.employeeId,
          reportDate: item.reportDate,
          projectId: item.projectId,
        },
      },
      update: item,
      create: item,
    })
  }

  const bulkCount = 720
  const maxEmployees = Math.min(state.employeeIds.length, 22)
  const employees = state.employeeIds.slice(0, maxEmployees)
  const projects = state.projectIds

  for (let i = 0; i < bulkCount; i += 1) {
    const employeeId = employees[i % employees.length]
    const reportDate = new Date(2026, 1 + (i % 3), 1 + (i % 28))
    const projectId = projects[i % projects.length]

    await prisma.dailyReport.upsert({
      where: {
        employeeId_reportDate_projectId: {
          employeeId,
          reportDate,
          projectId,
        },
      },
      update: {
        employeeId,
        projectId,
        reportDate,
        task: `Task ${i + 1}: Sprint execution`,
        workContent: `Completed workload item ${i + 1}, updated docs, and synced with team on project milestones.`,
      },
      create: {
        id: makeId('96000000', i + 1),
        employeeId,
        projectId,
        reportDate,
        task: `Task ${i + 1}: Sprint execution`,
        workContent: `Completed workload item ${i + 1}, updated docs, and synced with team on project milestones.`,
      },
    })
  }
}

