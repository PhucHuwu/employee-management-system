import { ProjectStatus } from '@prisma/client'

import type { SeedContext } from '../context'

export const seedProjects = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids, makeId, state } = ctx

  const baseItems = [
    {
      id: ids.projects.emsCore,
      code: 'EMS-CORE',
      name: 'Employee Management Core',
      status: ProjectStatus.RUNNING,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      description: 'Core platform for employee management',
    },
    {
      id: ids.projects.mobileApp,
      code: 'EMS-MOBILE',
      name: 'Employee Mobile App',
      status: ProjectStatus.PAUSED,
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-10-30'),
      description: 'Mobile companion app',
    },
    {
      id: ids.projects.dataHub,
      code: 'EMS-DATA',
      name: 'Data and Reporting Hub',
      status: ProjectStatus.ENDED,
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-12-31'),
      description: 'Data warehouse and BI dashboards',
    },
  ]

  const extraProjects = [
    { code: 'EMS-CRM', name: 'Customer Relationship Center', status: ProjectStatus.RUNNING, startDate: new Date('2026-01-15'), endDate: new Date('2026-11-30'), description: 'CRM module and customer portal' },
    { code: 'EMS-HR', name: 'HR Automation Suite', status: ProjectStatus.RUNNING, startDate: new Date('2026-02-10'), endDate: new Date('2026-12-20'), description: 'HR workflows automation and approvals' },
    { code: 'EMS-BI', name: 'Business Intelligence Dashboards', status: ProjectStatus.PAUSED, startDate: new Date('2026-01-20'), endDate: new Date('2026-09-30'), description: 'Executive dashboards and KPIs' },
    { code: 'EMS-OPS', name: 'Operations Optimization', status: ProjectStatus.RUNNING, startDate: new Date('2026-03-01'), endDate: new Date('2026-12-31'), description: 'Operational efficiency improvements' },
    { code: 'EMS-ARCHIVE', name: 'Legacy Data Archive', status: ProjectStatus.ENDED, startDate: new Date('2025-01-01'), endDate: new Date('2025-10-31'), description: 'Archive historical operational data' },
  ]

  for (const item of baseItems) {
    await prisma.project.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    })
  }

  for (const [index, item] of extraProjects.entries()) {
    const id = makeId('61000000', index + 1)
    if (!state.projectIds.includes(id)) state.projectIds.push(id)

    await prisma.project.upsert({
      where: { id },
      update: item,
      create: { id, ...item },
    })
  }
}

