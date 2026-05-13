import { TimesheetEntryStatus } from '@prisma/client'

import type { SeedContext } from '../context'

export const seedTimesheetEntries = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids } = ctx

  const items = [
    {
      id: ids.timesheetEntries.entry1,
      entryDate: new Date('2026-05-05'),
      normalWorkingTime: 8,
      overtime: 0,
      note: 'Làm module authentication',
      status: TimesheetEntryStatus.DRAFT,
      employeeId: ids.employees.nguyenAn,
      projectId: ids.projects.emsCore,
      taskId: ids.projectTasks.task1,
    },
    {
      id: ids.timesheetEntries.entry2,
      entryDate: new Date('2026-05-05'),
      normalWorkingTime: 7,
      overtime: 1,
      note: 'API development + bugfix',
      status: TimesheetEntryStatus.PENDING,
      employeeId: ids.employees.tranBinh,
      projectId: ids.projects.emsCore,
      taskId: ids.projectTasks.task2,
    },
    {
      id: ids.timesheetEntries.entry3,
      entryDate: new Date('2026-05-06'),
      normalWorkingTime: 8,
      overtime: 0,
      note: 'Dashboard widget implementation',
      status: TimesheetEntryStatus.APPROVED,
      employeeId: ids.employees.hoangEm,
      projectId: ids.projects.emsCore,
      taskId: ids.projectTasks.task3,
    },
    {
      id: ids.timesheetEntries.entry4,
      entryDate: new Date('2026-05-06'),
      normalWorkingTime: 6,
      overtime: 0,
      note: 'Mobile login UI',
      status: TimesheetEntryStatus.REJECTED,
      employeeId: ids.employees.ngoPhuong,
      projectId: ids.projects.mobileApp,
      taskId: ids.projectTasks.task4,
    },
    {
      id: ids.timesheetEntries.entry5,
      entryDate: new Date('2026-05-07'),
      normalWorkingTime: 8,
      overtime: 2,
      note: 'Data pipeline optimization',
      status: TimesheetEntryStatus.DRAFT,
      employeeId: ids.employees.leCuong,
      projectId: ids.projects.dataHub,
      taskId: ids.projectTasks.task5,
    },
  ]

  for (const item of items) {
    await prisma.timesheetEntry.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }
}
